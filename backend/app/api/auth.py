from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text as _sa_text
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User, Subscription
from app.schemas.schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.services.auth_service import hash_password, verify_password, create_access_token
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

TRIAL_DAYS = 14

@router.post("/register", response_model=TokenResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if len(payload.password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters.")
    email = payload.email.lower().strip()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=email,
        password_hash=hash_password(payload.password),
        company_name=payload.company_name,
        plan_tier="pro",
    )
    db.add(user)
    db.flush()  # get user.id before committing
    trial = Subscription(
        user_id=user.id,
        plan_tier="pro",
        status="trial",
        amount_paise=0,
        started_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(days=TRIAL_DAYS),
    )
    db.add(trial)
    db.commit()
    return TokenResponse(access_token=create_access_token(str(user.id)))

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return TokenResponse(access_token=create_access_token(str(user.id)))

@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.delete("/account")
def delete_account(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Permanently delete account and all associated data. Irreversible."""
    uid = str(user.id)
    db.execute(_sa_text(
        "DELETE FROM ops_insights USING ops_reports WHERE ops_insights.report_id = ops_reports.id AND ops_reports.user_id = :uid"
    ), {"uid": uid})
    db.execute(_sa_text("DELETE FROM ops_reports WHERE user_id = :uid"), {"uid": uid})
    db.execute(_sa_text("DELETE FROM ops_subscriptions WHERE user_id = :uid"), {"uid": uid})
    db.execute(_sa_text("DELETE FROM ops_manual_payments WHERE user_id = :uid"), {"uid": uid})
    db.execute(_sa_text("DELETE FROM ops_briefs WHERE user_id = :uid"), {"uid": uid})
    db.execute(_sa_text("DELETE FROM ops_users WHERE id = :uid"), {"uid": uid})
    db.commit()
    return {"status": "deleted", "message": "Your account and all data have been permanently deleted."}
