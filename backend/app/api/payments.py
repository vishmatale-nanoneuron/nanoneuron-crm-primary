import logging
from datetime import datetime, timedelta, timezone
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
        "price_paise": 99900,
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
        "price_paise": 499900,
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
    "Unlimited uploads",
    "AI risk scoring",
    "Delay probability analysis",
    "Inventory risk detection",
    "Executive AI summary",
    "Bottleneck recommendations",
]


@router.post("/create-order", response_model=CreateOrderResponse)
def create_order(
    body: CreateOrderRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    plan_tier = body.plan_tier.lower()
    if plan_tier not in PLANS:
        raise HTTPException(status_code=400, detail=f"Invalid plan. Choose: {list(PLANS)}")
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=503, detail="Payment gateway not configured yet.")

    plan = PLANS[plan_tier]
    try:
        import razorpay
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        order = client.order.create({
            "amount": plan["price_paise"],
            "currency": "INR",
            "payment_capture": True,
            "notes": {"user_id": str(user.id), "plan": plan_tier},
        })
    except Exception as exc:
        logger.error("Razorpay order creation failed: %s", exc)
        raise HTTPException(status_code=502, detail="Payment gateway error. Try again.")

    sub = Subscription(
        user_id=user.id,
        plan_tier=plan_tier,
        razorpay_order_id=order["id"],
        amount_paise=plan["price_paise"],
        status="pending",
    )
    db.add(sub)
    db.commit()

    return CreateOrderResponse(
        order_id=order["id"],
        amount=plan["price_paise"],
        currency="INR",
        key_id=settings.RAZORPAY_KEY_ID,
        plan_tier=plan_tier,
        plan_name=plan["label"],
    )


@router.post("/verify")
def verify_payment(
    body: VerifyPaymentRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=503, detail="Payment gateway not configured.")

    try:
        import razorpay
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        client.utility.verify_payment_signature({
            "razorpay_order_id": body.razorpay_order_id,
            "razorpay_payment_id": body.razorpay_payment_id,
            "razorpay_signature": body.razorpay_signature,
        })
    except Exception as exc:
        logger.warning("Payment signature invalid: %s", exc)
        raise HTTPException(status_code=400, detail="Invalid payment signature. Contact support.")

    sub = (
        db.query(Subscription)
        .filter(
            Subscription.razorpay_order_id == body.razorpay_order_id,
            Subscription.user_id == user.id,
        )
        .first()
    )
    if not sub:
        raise HTTPException(status_code=404, detail="Order not found.")

    sub.razorpay_payment_id = body.razorpay_payment_id
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
    # Auto-downgrade if trial/subscription expired
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
