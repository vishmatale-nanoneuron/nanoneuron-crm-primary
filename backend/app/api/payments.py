import logging
import time
import httpx
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.models import User, Subscription
from app.schemas.schemas import CreateOrderRequest, CreateOrderResponse, VerifyPaymentRequest, PlanResponse
from app.api.deps import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/payments", tags=["payments"])

INSTAMOJO_BASE = "https://api.instamojo.com"
INSTAMOJO_SANDBOX = "https://test.instamojo.com"

PLANS = {
    "pro": {
        "price_inr": 999,
        "label": "OpsOracle Pro",
        "features": [
            "Unlimited uploads",
            "AI risk scoring",
            "Industry benchmarks",
            "Risk trend dashboard",
            "Cost ROI analytics",
            "Vertical AI Score breakdown",
        ],
    },
    "enterprise": {
        "price_inr": 4999,
        "label": "OpsOracle Enterprise",
        "features": [
            "Everything in Pro",
            "REST API access",
            "Priority support",
            "Custom industry models",
            "White-label reports",
        ],
    },
}

FREE_FEATURES = [
    "3 uploads/day",
    "AI risk scoring",
    "Delay probability analysis",
    "Inventory risk detection",
    "Executive AI summary",
    "Bottleneck recommendations",
]


def _im_base() -> str:
    return INSTAMOJO_SANDBOX if settings.INSTAMOJO_ENV == "sandbox" else INSTAMOJO_BASE


def _im_token() -> str:
    """Get Instamojo OAuth2 access token."""
    resp = httpx.post(
        f"{_im_base()}/oauth2/token/",
        data={
            "grant_type": "client_credentials",
            "client_id": settings.INSTAMOJO_CLIENT_ID,
            "client_secret": settings.INSTAMOJO_CLIENT_SECRET,
        },
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


@router.post("/create-order", response_model=CreateOrderResponse)
def create_order(
    body: CreateOrderRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    plan_tier = body.plan_tier.lower()
    if plan_tier not in PLANS:
        raise HTTPException(status_code=400, detail=f"Invalid plan. Choose: {list(PLANS)}")
    if not settings.INSTAMOJO_CLIENT_ID or not settings.INSTAMOJO_CLIENT_SECRET:
        raise HTTPException(status_code=503, detail="Payment gateway not configured yet.")

    plan = PLANS[plan_tier]

    try:
        token = _im_token()
        resp = httpx.post(
            f"{_im_base()}/v2/payment_requests/",
            headers={"Authorization": f"Bearer {token}"},
            data={
                "purpose": f"{plan['label']} — OpsOracle AI",
                "amount": str(plan["price_inr"]),
                "buyer_name": getattr(user, "company_name", "") or user.email.split("@")[0],
                "email": user.email,
                "redirect_url": f"{settings.APP_URL}/payment/success",
                "allow_repeated_payments": "False",
                "send_email": "False",
                "send_sms": "False",
            },
            timeout=15,
        )
        resp.raise_for_status()
        im_order = resp.json()
    except httpx.HTTPStatusError as exc:
        logger.error("Instamojo order creation failed: %s %s", exc.response.status_code, exc.response.text)
        raise HTTPException(status_code=502, detail="Payment gateway error. Try again.")
    except Exception as exc:
        logger.error("Instamojo error: %s", exc)
        raise HTTPException(status_code=502, detail="Payment gateway error. Try again.")

    payment_request_id = im_order["id"]

    sub = Subscription(
        user_id=user.id,
        plan_tier=plan_tier,
        gateway_order_id=payment_request_id,
        amount_paise=plan["price_inr"] * 100,
        status="pending",
    )
    db.add(sub)
    db.commit()

    return CreateOrderResponse(
        order_id=payment_request_id,
        payment_url=im_order["longurl"],
        amount=plan["price_inr"],
        currency="INR",
        plan_tier=plan_tier,
        plan_name=plan["label"],
    )


@router.post("/verify")
def verify_payment(
    body: VerifyPaymentRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if not settings.INSTAMOJO_CLIENT_ID or not settings.INSTAMOJO_CLIENT_SECRET:
        raise HTTPException(status_code=503, detail="Payment gateway not configured.")

    try:
        token = _im_token()
        resp = httpx.get(
            f"{_im_base()}/v2/payment_requests/{body.order_id}/",
            headers={"Authorization": f"Bearer {token}"},
            timeout=15,
        )
        resp.raise_for_status()
        im_order = resp.json()
    except Exception as exc:
        logger.error("Instamojo verify failed: %s", exc)
        raise HTTPException(status_code=502, detail="Could not verify payment. Contact support.")

    payments = im_order.get("payments", [])
    paid = any(p.get("status") == "Credit" for p in payments)
    if not paid:
        status_str = payments[0].get("status", "pending") if payments else "no payments"
        raise HTTPException(
            status_code=400,
            detail=f"Payment not completed. Status: {status_str}",
        )

    sub = (
        db.query(Subscription)
        .filter(
            Subscription.gateway_order_id == body.order_id,
            Subscription.user_id == user.id,
        )
        .first()
    )
    if not sub:
        raise HTTPException(status_code=404, detail="Order not found.")

    payment_id = payments[0].get("payment_id") if payments else None
    sub.gateway_payment_id = payment_id
    sub.status = "active"
    sub.started_at = datetime.utcnow()
    sub.expires_at = datetime.utcnow() + timedelta(days=30)
    user.plan_tier = sub.plan_tier
    db.commit()

    return {"status": "success", "plan_tier": sub.plan_tier, "message": f"Upgraded to {sub.plan_tier}!"}


@router.get("/my-plan", response_model=PlanResponse)
def my_plan(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    tier = user.plan_tier or "free"
    active_sub = (
        db.query(Subscription)
        .filter(
            Subscription.user_id == user.id,
            Subscription.status.in_(["active", "trial"]),
        )
        .order_by(Subscription.expires_at.desc())
        .first()
    )
    if active_sub and active_sub.expires_at and active_sub.expires_at < datetime.utcnow():
        user.plan_tier = "free"
        tier = "free"
        db.commit()
        active_sub = None

    is_trial = active_sub is not None and active_sub.status == "trial"
    days_remaining = None
    if active_sub and active_sub.expires_at:
        delta = active_sub.expires_at - datetime.utcnow()
        days_remaining = max(0, delta.days)

    features = PLANS.get(tier, {}).get("features", FREE_FEATURES)
    return PlanResponse(
        plan_tier=tier,
        status=active_sub.status if active_sub else "free",
        expires_at=active_sub.expires_at if active_sub else None,
        features=features,
        is_trial=is_trial,
        days_remaining=days_remaining,
    )
