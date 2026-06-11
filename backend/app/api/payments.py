import logging
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

PLANS = {
    "pro": {
        "price_inr": 999,
        "price_usd": 12,
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
        "price_usd": 60,
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

# ── Cashfree ─────────────────────────────────────────────────

CF_PL_PROD = "https://api.cashfree.com/pl"
CF_PL_SANDBOX = "https://sandbox.cashfree.com/pl"
CF_API_VERSION = "2023-08-01"


def _cf_pl_base() -> str:
    return CF_PL_SANDBOX if settings.CASHFREE_ENV == "sandbox" else CF_PL_PROD


def _cf_headers() -> dict:
    return {
        "x-client-id": settings.CASHFREE_APP_ID,
        "x-client-secret": settings.CASHFREE_SECRET_KEY,
        "x-api-version": CF_API_VERSION,
        "Content-Type": "application/json",
    }


def _create_cashfree_order(plan_tier: str, plan: dict, user: User) -> tuple[str, str]:
    """Creates a Cashfree Payment Link. Returns (link_id, link_url)."""
    import time
    link_id = f"ops_{plan_tier}_{int(time.time())}_{str(user.id)[:8]}"
    resp = httpx.post(
        f"{_cf_pl_base()}/links",
        headers=_cf_headers(),
        json={
            "link_id": link_id,
            "link_amount": plan["price_inr"],
            "link_currency": "INR",
            "link_purpose": f"OpsOracle {plan['label']} — 30-day access",
            "customer_details": {
                "customer_id": str(user.id),
                "customer_email": user.email,
                "customer_phone": getattr(user, "phone", None) or "9999999999",
                "customer_name": getattr(user, "company_name", None) or user.email,
            },
            "link_meta": {
                "return_url": f"{settings.APP_URL}/payment/success?order_id={link_id}&gateway=cashfree",
                "upi_intent": False,
            },
            "link_notify": {
                "send_sms": False,
                "send_email": True,
            },
        },
        timeout=15,
    )
    resp.raise_for_status()
    cf = resp.json()
    return link_id, cf["link_url"]


# ── Stripe ────────────────────────────────────────────────────

def _create_stripe_order(plan_tier: str, plan: dict, user: User) -> tuple[str, str]:
    """Returns (checkout_session_id, payment_url)."""
    try:
        import stripe
    except ImportError:
        raise HTTPException(status_code=503, detail="Stripe library not installed.")

    stripe.api_key = settings.STRIPE_SECRET_KEY
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": "usd",
                "product_data": {"name": plan["label"], "description": "OpsOracle AI — 30-day access"},
                "unit_amount": plan["price_usd"] * 100,
            },
            "quantity": 1,
        }],
        mode="payment",
        customer_email=user.email,
        success_url=f"{settings.APP_URL}/payment/success?order_id={{CHECKOUT_SESSION_ID}}&gateway=stripe",
        cancel_url=f"{settings.APP_URL}/pricing",
        metadata={"user_id": str(user.id), "plan_tier": plan_tier},
    )
    return session.id, session.url


# ── Routes ────────────────────────────────────────────────────

@router.post("/create-order", response_model=CreateOrderResponse)
def create_order(
    body: CreateOrderRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    plan_tier = body.plan_tier.lower()
    if plan_tier not in PLANS:
        raise HTTPException(status_code=400, detail=f"Invalid plan. Choose: {list(PLANS)}")

    gateway = body.gateway.lower() if body.gateway else "cashfree"
    if gateway not in ("cashfree", "stripe"):
        raise HTTPException(status_code=400, detail="gateway must be 'cashfree' or 'stripe'")

    plan = PLANS[plan_tier]

    if gateway == "stripe":
        if not settings.STRIPE_SECRET_KEY:
            raise HTTPException(status_code=503, detail="Stripe not configured yet.")
        try:
            order_id, payment_url = _create_stripe_order(plan_tier, plan, user)
        except HTTPException:
            raise
        except Exception as exc:
            logger.error("Stripe error: %s", exc)
            raise HTTPException(status_code=502, detail="Payment gateway error. Try again.")
        amount = plan["price_usd"]
        currency = "USD"

    else:  # cashfree
        if not settings.CASHFREE_APP_ID or not settings.CASHFREE_SECRET_KEY:
            raise HTTPException(status_code=503, detail="Cashfree not configured yet.")
        try:
            order_id, payment_url = _create_cashfree_order(plan_tier, plan, user)
        except Exception as exc:
            logger.error("Cashfree error: %s", exc)
            raise HTTPException(status_code=502, detail="Payment gateway error. Try again.")
        amount = plan["price_inr"]
        currency = "INR"

    sub = Subscription(
        user_id=user.id,
        plan_tier=plan_tier,
        gateway=gateway,
        gateway_order_id=order_id,
        amount_paise=amount * 100,
        status="pending",
    )
    db.add(sub)
    db.commit()

    return CreateOrderResponse(
        order_id=order_id,
        payment_url=payment_url,
        amount=amount,
        currency=currency,
        plan_tier=plan_tier,
        plan_name=plan["label"],
    )


@router.post("/verify")
def verify_payment(
    body: VerifyPaymentRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    order_id = body.order_id
    gateway = getattr(body, "gateway", None) or (
        "stripe" if order_id.startswith("cs_") else "cashfree"
    )

    if gateway == "stripe":
        if not settings.STRIPE_SECRET_KEY:
            raise HTTPException(status_code=503, detail="Stripe not configured.")
        try:
            import stripe
            stripe.api_key = settings.STRIPE_SECRET_KEY
            session = stripe.checkout.Session.retrieve(order_id)
        except Exception as exc:
            logger.error("Stripe verify error: %s", exc)
            raise HTTPException(status_code=502, detail="Could not verify payment.")
        if session.payment_status != "paid":
            raise HTTPException(status_code=400, detail=f"Payment not completed. Status: {session.payment_status}")
        payment_ref = session.payment_intent

    else:  # cashfree
        if not settings.CASHFREE_APP_ID or not settings.CASHFREE_SECRET_KEY:
            raise HTTPException(status_code=503, detail="Cashfree not configured.")
        try:
            resp = httpx.get(
                f"{_cf_pl_base()}/links/{order_id}",
                headers=_cf_headers(),
                timeout=15,
            )
            resp.raise_for_status()
            cf_link = resp.json()
        except Exception as exc:
            logger.error("Cashfree verify error: %s", exc)
            raise HTTPException(status_code=502, detail="Could not verify payment.")
        if cf_link.get("link_status") != "PAID":
            raise HTTPException(status_code=400, detail=f"Payment not completed. Status: {cf_link.get('link_status')}")
        payment_ref = cf_link.get("cf_link_id")

    sub = (
        db.query(Subscription)
        .filter(Subscription.gateway_order_id == order_id, Subscription.user_id == user.id)
        .first()
    )
    if not sub:
        raise HTTPException(status_code=404, detail="Order not found.")

    sub.gateway_payment_id = str(payment_ref) if payment_ref else None
    sub.status = "active"
    sub.started_at = datetime.utcnow()
    sub.expires_at = datetime.utcnow() + timedelta(days=30)
    user.plan_tier = sub.plan_tier
    db.commit()

    return {"status": "success", "plan_tier": sub.plan_tier, "message": f"Upgraded to {sub.plan_tier}!"}


@router.get("/my-plan", response_model=PlanResponse)
def my_plan(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    tier = user.plan_tier or "free"
    active_sub = (
        db.query(Subscription)
        .filter(Subscription.user_id == user.id, Subscription.status.in_(["active", "trial"]))
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
        days_remaining = max(0, (active_sub.expires_at - datetime.utcnow()).days)

    features = PLANS.get(tier, {}).get("features", FREE_FEATURES)
    return PlanResponse(
        plan_tier=tier,
        status=active_sub.status if active_sub else "free",
        expires_at=active_sub.expires_at if active_sub else None,
        features=features,
        is_trial=is_trial,
        days_remaining=days_remaining,
    )
