"""Monday Morning Email digest trigger — Kai-Fu Lee retention loop principle."""
import hmac
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.services.email_service import send_all_digests, send_weekly_digest, send_all_trial_warnings
from app.models.models import User
from app.api.deps import get_current_user

router = APIRouter(prefix="/digest", tags=["digest"])


@router.post("/trigger")
def trigger_digest(secret: str, db: Session = Depends(get_db)):
    """
    Trigger Monday Morning digest for all eligible users.
    Called by Cloud Scheduler every Monday 8am IST (2:30am UTC).
    Requires DIGEST_SECRET env var to match the secret query param.
    """
    digest_secret = getattr(settings, "ADMIN_SECRET", "")
    if not digest_secret or not hmac.compare_digest(secret.encode(), digest_secret.encode()):
        raise HTTPException(status_code=403, detail="Invalid secret")
    digest_result = send_all_digests(db)
    trial_result = send_all_trial_warnings(db)
    return {"status": "ok", "digest": digest_result, "trial_warnings": trial_result}


@router.post("/preview")
def preview_digest(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Send a digest preview email to the currently logged-in user (for testing)."""
    sent = send_weekly_digest(user, db)
    if not sent:
        raise HTTPException(
            status_code=400,
            detail="Could not send preview — no recent reports found or RESEND_API_KEY not configured."
        )
    return {"status": "sent", "email": user.email}


@router.patch("/preferences")
def update_digest_preference(
    enabled: bool,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Toggle Monday Morning digest on/off for the current user."""
    user.email_digest = enabled
    db.commit()
    return {"email_digest": user.email_digest}
