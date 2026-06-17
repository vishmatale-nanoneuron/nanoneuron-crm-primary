import base64
import hashlib
import hmac
import json
import logging
import urllib.error
import urllib.request
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.models import User, Subscription
from app.schemas.schemas import BankTransferRequest, PlanResponse, RazorpayOrderRequest, RazorpayVerifyRequest
from app.api.deps import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/payments", tags=["payments"])


def _check_admin_secret(provided: str) -> None:
    expected = getattr(settings, "ADMIN_SECRET", "")
    if not expected or not hmac.compare_digest(provided.encode(), expected.encode()):
        raise HTTPException(status_code=403, detail="Invalid admin secret")

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
    "pro_annual": {
        "price_inr": 8999,
        "label": "OpsOracle Pro (Annual)",
        "features": [
            "Unlimited uploads",
            "AI risk scoring",
            "Industry benchmarks",
            "Risk trend dashboard",
            "Cost ROI analytics",
            "Vertical AI Score breakdown",
            "12 months access — save 25%",
        ],
    },
    "enterprise_annual": {
        "price_inr": 39999,
        "label": "OpsOracle Enterprise (Annual)",
        "features": [
            "Everything in Pro",
            "REST API access",
            "Priority support",
            "Custom industry models",
            "White-label reports",
            "12 months access — save 33%",
        ],
    },
}

PLAN_DURATION_DAYS = {
    "pro": 30, "enterprise": 30,
    "pro_annual": 365, "enterprise_annual": 365,
}

PLAN_BASE_TIER = {
    "pro": "pro", "enterprise": "enterprise",
    "pro_annual": "pro", "enterprise_annual": "enterprise",
}

FREE_FEATURES = [
    "3 uploads/day",
    "AI risk scoring",
    "Delay probability analysis",
    "Inventory risk detection",
    "Executive AI summary",
    "Bottleneck recommendations",
]

BANK_AMOUNTS = {
    "pro": 999, "enterprise": 4999,
    "pro_annual": 8999, "enterprise_annual": 39999,
}


def _activate_subscription(db: Session, sub: Subscription, payment_ref: str | None) -> str:
    """Idempotent: activate a pending subscription and promote the user's plan tier."""
    if sub.status == "active":
        return PLAN_BASE_TIER.get(sub.plan_tier, sub.plan_tier)
    duration = PLAN_DURATION_DAYS.get(sub.plan_tier, 30)
    base_tier = PLAN_BASE_TIER.get(sub.plan_tier, sub.plan_tier)
    sub.gateway_payment_id = payment_ref
    sub.status = "active"
    sub.started_at = datetime.utcnow()
    sub.expires_at = datetime.utcnow() + timedelta(days=duration)
    user = db.query(User).filter(User.id == sub.user_id).first()
    if user:
        user.plan_tier = base_tier
    db.commit()
    return base_tier


# ── Bank details ──────────────────────────────────────────────

@router.get("/bank-details")
def get_bank_details(user: User = Depends(get_current_user)):
    """Returns UPI ID and bank account details for direct transfer."""
    if not settings.UPI_ID and not settings.BANK_ACCOUNT_NUMBER:
        raise HTTPException(status_code=503, detail="Bank transfer not configured. Contact service@nanoneuron.ai")
    return {
        "upi_id": settings.UPI_ID or None,
        "account_name": settings.BANK_ACCOUNT_NAME or None,
        "account_number": settings.BANK_ACCOUNT_NUMBER or None,
        "ifsc": settings.BANK_IFSC or None,
        "bank_name": settings.BANK_NAME or None,
        "amounts": BANK_AMOUNTS,
    }


# ── User submits UTR after paying ─────────────────────────────

@router.post("/bank-transfer")
def submit_bank_transfer(
    body: BankTransferRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """User submits UTR after completing a bank/UPI transfer. Plan activates after admin approval."""
    from app.models.models import ManualPayment
    plan_tier = body.plan_tier.lower()
    if plan_tier not in BANK_AMOUNTS:
        raise HTTPException(status_code=400, detail="Invalid plan tier.")
    utr = body.utr_reference.strip()
    if len(utr) < 6:
        raise HTTPException(status_code=400, detail="Enter a valid UTR / transaction reference (min 6 characters).")
    existing = db.query(ManualPayment).filter(ManualPayment.utr_reference == utr).first()
    if existing:
        raise HTTPException(status_code=409, detail="This UTR reference has already been submitted.")
    amount = BANK_AMOUNTS[plan_tier]
    mp = ManualPayment(
        user_id=user.id,
        plan_tier=plan_tier,
        amount_inr=amount,
        utr_reference=utr,
        transfer_method=body.transfer_method.lower(),
        notes=body.notes or None,
        status="pending",
    )
    db.add(mp)
    db.commit()
    db.refresh(mp)
    try:
        from app.services.email_service import notify_admin_bank_transfer
        notify_admin_bank_transfer(user.email, plan_tier, amount, utr, body.transfer_method)
    except Exception:
        pass
    return {
        "id": str(mp.id),
        "status": "pending",
        "plan_tier": plan_tier,
        "amount_inr": amount,
        "utr_reference": utr,
        "message": "Payment submitted — we'll activate your plan within 2–4 business hours on weekdays.",
    }


@router.get("/bank-transfer/my")
def my_bank_transfers(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """User checks status of their own bank transfer submissions."""
    from app.models.models import ManualPayment
    rows = (
        db.query(ManualPayment)
        .filter(ManualPayment.user_id == user.id)
        .order_by(ManualPayment.created_at.desc())
        .all()
    )
    return [
        {
            "id": str(r.id),
            "plan_tier": r.plan_tier,
            "amount_inr": r.amount_inr,
            "utr_reference": r.utr_reference,
            "transfer_method": r.transfer_method,
            "status": r.status,
            "rejection_reason": r.rejection_reason,
            "created_at": r.created_at.isoformat(),
        }
        for r in rows
    ]


# ── Admin endpoints ───────────────────────────────────────────

@router.get("/bank-transfer/pending")
def list_pending_bank_transfers(secret: str, db: Session = Depends(get_db)):
    """Admin: list all pending bank transfer submissions."""
    _check_admin_secret(secret)
    from app.models.models import ManualPayment
    from sqlalchemy.orm import joinedload
    rows = (
        db.query(ManualPayment)
        .options(joinedload(ManualPayment.user))
        .filter(ManualPayment.status == "pending")
        .order_by(ManualPayment.created_at.asc())
        .all()
    )
    return [
        {
            "id": str(r.id),
            "user_email": r.user.email if r.user else "?",
            "company_name": (r.user.company_name if r.user else "") or "",
            "plan_tier": r.plan_tier,
            "amount_inr": r.amount_inr,
            "utr_reference": r.utr_reference,
            "transfer_method": r.transfer_method,
            "notes": r.notes or "",
            "status": r.status,
            "created_at": r.created_at.isoformat(),
        }
        for r in rows
    ]


@router.post("/bank-transfer/{payment_id}/approve")
def approve_bank_transfer(payment_id: str, secret: str, db: Session = Depends(get_db)):
    """Admin: approve a bank transfer and activate the user's plan."""
    _check_admin_secret(secret)
    from app.models.models import ManualPayment
    mp = db.query(ManualPayment).filter(ManualPayment.id == payment_id).first()
    if not mp:
        raise HTTPException(status_code=404, detail="Payment not found")
    if mp.status == "approved":
        return {"status": "already_approved"}
    sub = Subscription(
        user_id=mp.user_id,
        plan_tier=mp.plan_tier,
        gateway="bank_transfer",
        gateway_order_id=str(mp.id),
        gateway_payment_id=mp.utr_reference,
        amount_paise=mp.amount_inr * 100,
        status="pending",
    )
    db.add(sub)
    db.flush()
    base_tier = _activate_subscription(db, sub, mp.utr_reference)
    mp.status = "approved"
    mp.approved_at = datetime.utcnow()
    db.commit()
    u = db.query(User).filter(User.id == mp.user_id).first()
    if u:
        try:
            from app.services.email_service import notify_user_payment_approved
            notify_user_payment_approved(u.email, u.company_name or u.email, base_tier, mp.amount_inr)
        except Exception:
            pass
    logger.info("Bank transfer approved: plan=%s UTR=%s user=%s", base_tier, mp.utr_reference, mp.user_id)
    return {"status": "approved", "plan_tier": base_tier}


@router.post("/bank-transfer/{payment_id}/reject")
def reject_bank_transfer(
    payment_id: str,
    secret: str,
    reason: str = "Payment could not be verified",
    db: Session = Depends(get_db),
):
    """Admin: reject a bank transfer with a reason."""
    _check_admin_secret(secret)
    from app.models.models import ManualPayment
    mp = db.query(ManualPayment).filter(ManualPayment.id == payment_id).first()
    if not mp:
        raise HTTPException(status_code=404, detail="Payment not found")
    mp.status = "rejected"
    mp.rejection_reason = reason
    db.commit()
    logger.info("Bank transfer rejected: id=%s reason=%s", payment_id, reason)
    return {"status": "rejected", "reason": reason}


# ── Razorpay gateway ─────────────────────────────────────────

def _razorpay_create_order(amount_paise: int, receipt: str) -> dict:
    """Call Razorpay API to create an order — stdlib only, no SDK dependency."""
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise HTTPException(
            status_code=503,
            detail="Instant payment not configured — please use bank transfer or contact service@nanoneuron.ai",
        )
    auth = base64.b64encode(
        f"{settings.RAZORPAY_KEY_ID}:{settings.RAZORPAY_KEY_SECRET}".encode()
    ).decode()
    payload = json.dumps({"amount": amount_paise, "currency": "INR", "receipt": receipt}).encode()
    req = urllib.request.Request(
        "https://api.razorpay.com/v1/orders",
        data=payload,
        headers={"Content-Type": "application/json", "Authorization": f"Basic {auth}"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as exc:
        body = exc.read().decode(errors="ignore")
        logger.error("Razorpay order creation failed: %s %s", exc.code, body)
        raise HTTPException(status_code=502, detail="Payment gateway error — please use bank transfer or contact support.")
    except Exception as exc:
        logger.error("Razorpay order error: %s", exc)
        raise HTTPException(status_code=502, detail="Could not reach payment gateway. Please try again.")


@router.post("/razorpay/create-order")
async def create_razorpay_order(
    body: RazorpayOrderRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Create a Razorpay order for the selected plan — returns key_id + order_id for the checkout SDK."""
    plan_tier = body.plan_tier.lower()
    amount_inr = BANK_AMOUNTS.get(plan_tier)
    if not amount_inr:
        raise HTTPException(status_code=400, detail="Invalid plan tier.")

    receipt = f"opsoracle_{str(user.id)[:8]}_{plan_tier}"
    order = await run_in_threadpool(_razorpay_create_order, amount_inr * 100, receipt)

    sub = Subscription(
        user_id=user.id,
        plan_tier=plan_tier,
        gateway="razorpay",
        gateway_order_id=order["id"],
        razorpay_order_id=order["id"],
        amount_paise=amount_inr * 100,
        status="pending",
    )
    db.add(sub)
    db.commit()

    logger.info("Razorpay order created: plan=%s order=%s user=%s", plan_tier, order["id"], user.id)
    return {
        "order_id": order["id"],
        "amount": amount_inr * 100,
        "currency": "INR",
        "key_id": settings.RAZORPAY_KEY_ID,
        "plan_tier": plan_tier,
    }


@router.post("/razorpay/verify")
async def verify_razorpay_payment(
    body: RazorpayVerifyRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Verify Razorpay payment signature and instantly activate the user's plan."""
    if not settings.RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=503, detail="Payment verification unavailable.")

    # Razorpay signature: HMAC_SHA256(order_id + "|" + payment_id, key_secret) hex digest
    msg = f"{body.order_id}|{body.payment_id}".encode()
    expected = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        msg,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected, body.signature):
        logger.warning("Razorpay signature mismatch: user=%s order=%s", user.id, body.order_id)
        raise HTTPException(status_code=400, detail="Payment signature invalid — contact service@nanoneuron.ai if you were charged.")

    sub = (
        db.query(Subscription)
        .filter(
            Subscription.razorpay_order_id == body.order_id,
            Subscription.user_id == user.id,
        )
        .first()
    )
    if not sub:
        raise HTTPException(status_code=404, detail="Order not found. Contact service@nanoneuron.ai with your payment ID.")

    if sub.status == "active":
        return {"status": "active", "plan_tier": PLAN_BASE_TIER.get(sub.plan_tier, sub.plan_tier)}

    sub.razorpay_payment_id = body.payment_id
    sub.gateway_payment_id = body.payment_id
    base_tier = _activate_subscription(db, sub, body.payment_id)

    try:
        from app.services.email_service import notify_user_payment_approved
        notify_user_payment_approved(
            user.email,
            user.company_name or user.email,
            base_tier,
            BANK_AMOUNTS.get(sub.plan_tier, 0),
        )
    except Exception:
        pass

    logger.info("Razorpay payment verified: plan=%s payment=%s user=%s", base_tier, body.payment_id, user.id)
    return {"status": "active", "plan_tier": base_tier}


# ── My plan ───────────────────────────────────────────────────

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
    is_annual = active_sub is not None and "_annual" in (active_sub.plan_tier or "")
    days_remaining = None
    if active_sub and active_sub.expires_at:
        days_remaining = max(0, (active_sub.expires_at - datetime.utcnow()).days)

    sub_plan_key = (active_sub.plan_tier if active_sub else None) or tier
    features = PLANS.get(sub_plan_key, PLANS.get(tier, {})).get("features", FREE_FEATURES)
    return PlanResponse(
        plan_tier=tier,
        status=active_sub.status if active_sub else "free",
        expires_at=active_sub.expires_at if active_sub else None,
        features=features,
        is_trial=is_trial,
        days_remaining=days_remaining,
        is_annual=is_annual,
    )
