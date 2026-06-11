import logging
import time
import httpx
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.models import User, Subscription
from app.schemas.schemas import CreateOrderRequest, CreateOrderResponse, VerifyPaymentRequest, PlanResponse
from app.api.deps import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/payments", tags=["payments"])

CASHFREE_BASE = "https://api.cashfree.com/pg"
CASHFREE_SANDBOX = "https://sandbox.cashfree.com/pg"
CF_API_VERSION = "2023-08-01"

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


def _cf_headers() -> dict:
    return {
        "x-client-id": settings.CASHFREE_APP_ID,
        "x-client-secret": settings.CASHFREE_SECRET_KEY,
        "x-api-version": CF_API_VERSION,
        "Content-Type": "application/json",
    }


def _cf_base() -> str:
    return CASHFREE_SANDBOX if settings.CASHFREE_ENV == "sandbox" else CASHFREE_BASE


@router.post("/create-order", response_model=CreateOrderResponse)
def create_order(
    body: CreateOrderRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    plan_tier = body.plan_tier.lower()
    if plan_tier not in PLANS:
        raise HTTPException(status_code=400, detail=f"Invalid plan. Choose: {list(PLANS)}")
    if not settings.CASHFREE_APP_ID or not settings.CASHFREE_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Payment gateway not configured yet.")

    plan = PLANS[plan_tier]
    order_id = f"ops_{plan_tier}_{int(time.time())}_{str(user.id)[:8]}"

    try:
        resp = httpx.post(
            f"{_cf_base()}/orders",
            headers=_cf_headers(),
            json={
                "order_id": order_id,
                "order_amount": plan["price_inr"],
                "order_currency": "INR",
                "customer_details": {
                    "customer_id": str(user.id),
                    "customer_email": user.email,
                    "customer_phone": getattr(user, "phone", None) or "9999999999",
                },
                "order_meta": {
                    "return_url": f"{settings.APP_URL}/payment/success?order_id={{order_id}}",
                },
                "order_note": f"{plan['label']} — OpsOracle AI",
            },
            timeout=15,
        )
        resp.raise_for_status()
        cf_order = resp.json()
    except httpx.HTTPStatusError as exc:
        logger.error("Cashfree order creation failed: %s %s", exc.response.status_code, exc.response.text)
        raise HTTPException(status_code=502, detail="Payment gateway error. Try again.")
    except Exception as exc:
        logger.error("Cashfree error: %s", exc)
        raise HTTPException(status_code=502, detail="Payment gateway error. Try again.")

    sub = Subscription(
        user_id=user.id,
        plan_tier=plan_tier,
        gateway_order_id=order_id,
        amount_paise=plan["price_inr"] * 100,
        status="pending",
    )
    db.add(sub)
    db.commit()

    return CreateOrderResponse(
        order_id=order_id,
        payment_session_id=cf_order["payment_session_id"],
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
    if not settings.CASHFREE_APP_ID or not settings.CASHFREE_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Payment gateway not configured.")

    try:
        resp = httpx.get(
            f"{_cf_base()}/orders/{body.order_id}",
            headers=_cf_headers(),
            timeout=15,
        )
        resp.raise_for_status()
        cf_order = resp.json()
    except Exception as exc:
        logger.error("Cashfree order fetch failed: %s", exc)
        raise HTTPException(status_code=502, detail="Could not verify payment. Contact support.")

    if cf_order.get("order_status") != "PAID":
        raise HTTPException(
            status_code=400,
            detail=f"Payment not completed. Status: {cf_order.get('order_status', 'unknown')}",
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

    # Get CF payment ID from order payments
    cf_payment_id = None
    try:
        pay_resp = httpx.get(
            f"{_cf_base()}/orders/{body.order_id}/payments",
            headers=_cf_headers(),
            timeout=15,
        )
        if pay_resp.status_code == 200:
            payments = pay_resp.json()
            if payments:
                cf_payment_id = payments[0].get("cf_payment_id")
    except Exception:
        pass

    sub.gateway_payment_id = str(cf_payment_id) if cf_payment_id else None
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
