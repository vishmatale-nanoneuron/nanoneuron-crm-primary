"""Admin dashboard API — live metrics, pending payments, quick approve."""
import hmac
import logging
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.config import settings
from app.models.models import User, Report, Insight, Subscription, ManualPayment

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["admin"])


def _auth(secret: str) -> None:
    expected = getattr(settings, "ADMIN_SECRET", "")
    if not expected or not hmac.compare_digest(secret.encode(), expected.encode()):
        raise HTTPException(status_code=403, detail="Invalid admin secret")


@router.get("/stats")
def dashboard_stats(secret: str, db: Session = Depends(get_db)):
    """Live dashboard metrics."""
    _auth(secret)
    now = datetime.utcnow()
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    total_users = db.query(func.count(User.id)).scalar() or 0
    users_today = db.query(func.count(User.id)).filter(User.created_at >= today).scalar() or 0
    users_week = db.query(func.count(User.id)).filter(User.created_at >= week_ago).scalar() or 0

    total_reports = db.query(func.count(Report.id)).filter(~Report.file_name.like("demo_%")).scalar() or 0
    reports_today = db.query(func.count(Report.id)).filter(Report.created_at >= today, ~Report.file_name.like("demo_%")).scalar() or 0
    reports_week = db.query(func.count(Report.id)).filter(Report.created_at >= week_ago, ~Report.file_name.like("demo_%")).scalar() or 0

    active_subs = db.query(func.count(Subscription.id)).filter(
        Subscription.status == "active",
        Subscription.expires_at >= now,
    ).scalar() or 0
    trial_subs = db.query(func.count(Subscription.id)).filter(
        Subscription.status == "trial",
        Subscription.expires_at >= now,
    ).scalar() or 0

    revenue_month = db.query(func.sum(ManualPayment.amount_inr)).filter(
        ManualPayment.status == "approved",
        ManualPayment.approved_at >= month_ago,
    ).scalar() or 0
    revenue_total = db.query(func.sum(ManualPayment.amount_inr)).filter(
        ManualPayment.status == "approved",
    ).scalar() or 0

    pending_payments = db.query(func.count(ManualPayment.id)).filter(
        ManualPayment.status == "pending"
    ).scalar() or 0

    avg_risk = db.query(func.avg(Insight.risk_score)).filter(
        Insight.created_at >= week_ago
    ).scalar()

    return {
        "users": {"total": total_users, "today": users_today, "this_week": users_week},
        "reports": {"total": total_reports, "today": reports_today, "this_week": reports_week},
        "subscriptions": {"active": active_subs, "trial": trial_subs},
        "revenue": {"this_month_inr": int(revenue_month), "total_inr": int(revenue_total)},
        "pending_payments": pending_payments,
        "avg_risk_score_7d": round(float(avg_risk), 1) if avg_risk else None,
        "generated_at": now.isoformat(),
    }


@router.get("/pending-payments")
def list_pending(secret: str, db: Session = Depends(get_db)):
    """Pending UPI/bank payments awaiting approval."""
    _auth(secret)
    rows = (
        db.query(ManualPayment)
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
            "created_at": r.created_at.isoformat(),
        }
        for r in rows
    ]


@router.post("/payments/{payment_id}/approve")
def quick_approve(payment_id: str, secret: str, db: Session = Depends(get_db)):
    """One-click approve — activates plan immediately."""
    _auth(secret)
    from app.models.models import Subscription
    from app.api.payments import _activate_subscription, PLAN_DURATION_DAYS, PLAN_BASE_TIER, BANK_AMOUNTS
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
    logger.info("Quick-approved: plan=%s UTR=%s user=%s", base_tier, mp.utr_reference, mp.user_id)
    return {"status": "approved", "plan_tier": base_tier}


@router.post("/payments/{payment_id}/reject")
def quick_reject(payment_id: str, secret: str, reason: str = "Payment could not be verified", db: Session = Depends(get_db)):
    _auth(secret)
    mp = db.query(ManualPayment).filter(ManualPayment.id == payment_id).first()
    if not mp:
        raise HTTPException(status_code=404, detail="Payment not found")
    mp.status = "rejected"
    mp.rejection_reason = reason
    db.commit()
    return {"status": "rejected"}


@router.get("/recent-signups")
def recent_signups(secret: str, limit: int = 10, db: Session = Depends(get_db)):
    _auth(secret)
    users = db.query(User).order_by(User.created_at.desc()).limit(limit).all()
    return [
        {
            "email": u.email,
            "company": u.company_name or "",
            "plan": u.plan_tier,
            "joined": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]
