import base64
import hashlib
import hmac
import json
import logging
import httpx
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.models import User, Subscription
from app.schemas.schemas import (
    CreateOrderRequest, CreateOrderResponse,
    VerifyPaymentRequest, PlanResponse,
    RazorpayOrderResponse, VerifyRazorpayRequest,
    BankTransferRequest, ManualPaymentResponse,
)
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
    "pro_annual": {
        "price_inr": 8999,
        "price_usd": 99,
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
        "price_usd": 599,
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
    "pro": 30,
    "enterprise": 30,
    "pro_annual": 365,
    "enterprise_annual": 365,
}

PLAN_BASE_TIER = {
    "pro": "pro",
    "enterprise": "enterprise",
    "pro_annual": "pro",
    "enterprise_annual": "enterprise",
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
            "link_purpose": f"{plan['label']} — {'365-day' if '_annual' in plan_tier else '30-day'} access",
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


# ── Razorpay ─────────────────────────────────────────────────

def _create_razorpay_order(plan_tier: str, plan: dict, user: User) -> tuple[str, int]:
    """Creates a Razorpay order. Returns (order_id, amount_paise)."""
    import razorpay
    import time
    client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    receipt = f"ops_{plan_tier}_{int(time.time())}_{str(user.id)[:8]}"
    amount_paise = plan["price_inr"] * 100
    order = client.order.create({
        "amount": amount_paise,
        "currency": "INR",
        "receipt": receipt,
        "notes": {
            "user_id": str(user.id),
            "plan_tier": plan_tier,
            "product": "OpsOracle AI",
        },
    })
    return order["id"], amount_paise


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
                "product_data": {"name": plan["label"], "description": f"OpsOracle AI — {'365-day' if '_annual' in plan_tier else '30-day'} access"},
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


# ── Shared activation helper ─────────────────────────────────

def _activate_subscription(db: Session, sub: Subscription, payment_ref: str | None) -> str:
    """Idempotent: activate a pending subscription and promote the user's plan tier.
    Returns the resolved base_tier string. Safe to call multiple times."""
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


# ── Webhook endpoints (unauthenticated — called by payment gateways) ──────────

@router.post("/cashfree-webhook")
async def cashfree_webhook(request: Request, db: Session = Depends(get_db)):
    """Cashfree payment link webhook. Activates the subscription when payment is confirmed.
    Idempotent — safe to receive duplicate events. No JWT required."""
    body = await request.body()

    # Verify HMAC-SHA256 signature if secret is configured
    sig_header = request.headers.get("x-webhook-signature", "")
    if settings.CASHFREE_SECRET_KEY and sig_header:
        computed = base64.b64encode(
            hmac.new(
                settings.CASHFREE_SECRET_KEY.encode("utf-8"),
                body,
                hashlib.sha256,
            ).digest()
        ).decode()
        if not hmac.compare_digest(computed, sig_header):
            logger.warning("Cashfree webhook: invalid signature — rejecting")
            raise HTTPException(status_code=400, detail="Invalid webhook signature")

    try:
        payload = json.loads(body)
    except (json.JSONDecodeError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    # Extract link_id — Cashfree payment link event structure
    data = payload.get("data", {})
    link_data = data.get("link", {})
    link_id = (
        link_data.get("link_id")
        or data.get("order", {}).get("order_id")
        or payload.get("link_id")       # flat format (older API versions)
    )

    if not link_id:
        logger.info("Cashfree webhook: no link_id found in payload, ignoring")
        return {"status": "ignored", "reason": "no link_id"}

    # Only activate on PAID / SUCCESS status
    link_status = link_data.get("link_status", "").upper()
    payment_status = data.get("payment", {}).get("payment_status", "").upper()
    if link_status not in ("PAID",) and payment_status not in ("SUCCESS",):
        return {"status": "ignored", "reason": f"not completed: {link_status}/{payment_status}"}

    sub = db.query(Subscription).filter(Subscription.gateway_order_id == link_id).first()
    if not sub:
        logger.warning("Cashfree webhook: no subscription found for link_id=%s", link_id)
        return {"status": "ignored", "reason": "subscription not found"}

    payment_ref = str(data.get("payment", {}).get("cf_payment_id", "") or "")
    base_tier = _activate_subscription(db, sub, payment_ref or None)
    logger.info("Cashfree webhook: activated plan=%s for link_id=%s", base_tier, link_id)
    return {"status": "activated", "plan_tier": base_tier}


@router.post("/stripe-webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Stripe webhook. Activates the subscription on checkout.session.completed.
    Idempotent — safe to receive duplicate events. No JWT required."""
    body = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        import stripe as stripe_lib
        stripe_lib.api_key = settings.STRIPE_SECRET_KEY

        if settings.STRIPE_WEBHOOK_SECRET and sig_header:
            event = stripe_lib.Webhook.construct_event(
                body, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        else:
            # No webhook secret configured — accept without signature (dev/sandbox only)
            event = json.loads(body)
    except Exception as exc:
        logger.warning("Stripe webhook: signature/parse error — %s", exc)
        raise HTTPException(status_code=400, detail=f"Webhook error: {exc}")

    if event.get("type") != "checkout.session.completed":
        return {"status": "ignored", "event_type": event.get("type")}

    session = event.get("data", {}).get("object", {})
    if session.get("payment_status") != "paid":
        return {"status": "ignored", "reason": f"payment_status={session.get('payment_status')}"}

    session_id = session.get("id", "")
    sub = db.query(Subscription).filter(Subscription.gateway_order_id == session_id).first()
    if not sub:
        logger.warning("Stripe webhook: no subscription found for session_id=%s", session_id)
        return {"status": "ignored", "reason": "subscription not found"}

    payment_intent = session.get("payment_intent") or None
    base_tier = _activate_subscription(db, sub, str(payment_intent) if payment_intent else None)
    logger.info("Stripe webhook: activated plan=%s for session_id=%s", base_tier, session_id)
    return {"status": "activated", "plan_tier": base_tier}


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

    base_tier = _activate_subscription(db, sub, str(payment_ref) if payment_ref else None)
    return {"status": "success", "plan_tier": base_tier, "message": f"Upgraded to {sub.plan_tier}!"}


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


# ── Razorpay card payment (embedded modal — no redirect) ─────

@router.post("/create-razorpay-order", response_model=RazorpayOrderResponse)
def create_razorpay_order_endpoint(
    body: CreateOrderRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    plan_tier = body.plan_tier.lower()
    if plan_tier not in PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan tier.")
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=503, detail="Card payments not configured yet.")
    plan = PLANS[plan_tier]
    try:
        rzp_order_id, amount_paise = _create_razorpay_order(plan_tier, plan, user)
    except Exception as exc:
        logger.error("Razorpay order error: %s", exc)
        raise HTTPException(status_code=502, detail="Could not create card payment order.")
    sub = Subscription(
        user_id=user.id,
        plan_tier=plan_tier,
        gateway="razorpay",
        gateway_order_id=rzp_order_id,
        razorpay_order_id=rzp_order_id,
        amount_paise=amount_paise,
        status="pending",
    )
    db.add(sub)
    db.commit()
    return RazorpayOrderResponse(
        order_id=rzp_order_id,
        amount=amount_paise,
        currency="INR",
        key_id=settings.RAZORPAY_KEY_ID,
        plan_tier=plan_tier,
        plan_name=plan["label"],
        prefill_email=user.email,
        prefill_name=getattr(user, "company_name", None) or user.email,
    )


@router.post("/verify-razorpay")
def verify_razorpay_payment(
    body: VerifyRazorpayRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Verify Razorpay payment signature and activate the plan."""
    message = f"{body.razorpay_order_id}|{body.razorpay_payment_id}"
    expected = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    if not hmac.compare_digest(expected, body.razorpay_signature):
        raise HTTPException(status_code=400, detail="Invalid payment signature.")
    sub = (
        db.query(Subscription)
        .filter(Subscription.gateway_order_id == body.razorpay_order_id, Subscription.user_id == user.id)
        .first()
    )
    if not sub:
        raise HTTPException(status_code=404, detail="Order not found.")
    sub.razorpay_payment_id = body.razorpay_payment_id
    base_tier = _activate_subscription(db, sub, body.razorpay_payment_id)
    return {"status": "success", "plan_tier": base_tier}


@router.post("/razorpay-webhook")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    """Razorpay webhook — activates plan on payment.captured / order.paid. No JWT required."""
    body = await request.body()
    sig_header = request.headers.get("x-razorpay-signature", "")
    if settings.RAZORPAY_WEBHOOK_SECRET and sig_header:
        computed = hmac.new(
            settings.RAZORPAY_WEBHOOK_SECRET.encode("utf-8"),
            body,
            hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(computed, sig_header):
            raise HTTPException(status_code=400, detail="Invalid webhook signature")
    try:
        payload = json.loads(body)
    except (json.JSONDecodeError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid JSON")
    event = payload.get("event", "")
    if event not in ("payment.captured", "order.paid"):
        return {"status": "ignored", "event": event}
    entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
    order_id = entity.get("order_id") or payload.get("payload", {}).get("order", {}).get("entity", {}).get("id")
    payment_id = entity.get("id")
    if not order_id:
        return {"status": "ignored", "reason": "no order_id"}
    sub = db.query(Subscription).filter(Subscription.gateway_order_id == order_id).first()
    if not sub:
        return {"status": "ignored", "reason": "subscription not found"}
    if payment_id and not sub.razorpay_payment_id:
        sub.razorpay_payment_id = payment_id
    base_tier = _activate_subscription(db, sub, payment_id)
    logger.info("Razorpay webhook: activated plan=%s order=%s", base_tier, order_id)
    return {"status": "activated", "plan_tier": base_tier}


# ── Direct bank transfer / UPI (zero gateway fees) ───────────

BANK_AMOUNTS = {
    "pro": 999, "enterprise": 4999,
    "pro_annual": 8999, "enterprise_annual": 39999,
}


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


@router.get("/bank-transfer/pending")
def list_pending_bank_transfers(secret: str, db: Session = Depends(get_db)):
    """Admin: list all pending bank transfer submissions. Requires ADMIN_SECRET query param."""
    admin_secret = getattr(settings, "ADMIN_SECRET", "")
    if not admin_secret or secret != admin_secret:
        raise HTTPException(status_code=403, detail="Invalid admin secret")
    from app.models.models import ManualPayment
    rows = (
        db.query(ManualPayment)
        .filter(ManualPayment.status == "pending")
        .order_by(ManualPayment.created_at.asc())
        .all()
    )
    result = []
    for r in rows:
        u = db.query(User).filter(User.id == r.user_id).first()
        result.append({
            "id": str(r.id),
            "user_email": u.email if u else "?",
            "company_name": (u.company_name if u else "") or "",
            "plan_tier": r.plan_tier,
            "amount_inr": r.amount_inr,
            "utr_reference": r.utr_reference,
            "transfer_method": r.transfer_method,
            "notes": r.notes or "",
            "status": r.status,
            "created_at": r.created_at.isoformat(),
        })
    return result


@router.post("/bank-transfer/{payment_id}/approve")
def approve_bank_transfer(
    payment_id: str,
    secret: str,
    db: Session = Depends(get_db),
):
    """Admin: approve a bank transfer submission and activate the user's plan."""
    admin_secret = getattr(settings, "ADMIN_SECRET", "")
    if not admin_secret or secret != admin_secret:
        raise HTTPException(status_code=403, detail="Invalid admin secret")
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
    admin_secret = getattr(settings, "ADMIN_SECRET", "")
    if not admin_secret or secret != admin_secret:
        raise HTTPException(status_code=403, detail="Invalid admin secret")
    from app.models.models import ManualPayment
    mp = db.query(ManualPayment).filter(ManualPayment.id == payment_id).first()
    if not mp:
        raise HTTPException(status_code=404, detail="Payment not found")
    mp.status = "rejected"
    mp.rejection_reason = reason
    db.commit()
    logger.info("Bank transfer rejected: id=%s reason=%s", payment_id, reason)
    return {"status": "rejected", "reason": reason}
