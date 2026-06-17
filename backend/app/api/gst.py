"""GSTGuard module — GST notice upload, draft generation, CA review workflow."""
import json
import io
import logging
from datetime import date, datetime
from typing import Optional
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, GSTNotice, GSTDraft, GSTCorpus
from app.services import gst_ai

router = APIRouter(prefix="/gst", tags=["gst"])
logger = logging.getLogger(__name__)

PAID_PLANS = {"pro", "enterprise"}


def _require_paid(user: User):
    if user.plan_tier not in PAID_PLANS:
        raise HTTPException(status_code=402, detail="Pro or Enterprise plan required for GSTGuard")


def _extract_pdf_text(content: bytes) -> str:
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            return "\n".join(page.extract_text() or "" for page in pdf.pages)
    except Exception as exc:
        logger.warning("pdfplumber failed: %s", exc)
        return ""


def _days_until(deadline_str: Optional[str]) -> Optional[int]:
    if not deadline_str:
        return None
    try:
        return (date.fromisoformat(deadline_str) - date.today()).days
    except Exception:
        return None


def _notice_dict(notice: GSTNotice) -> dict:
    days_left = _days_until(notice.deadline)
    urgency = (
        "overdue" if (days_left is not None and days_left < 0) else
        "critical" if (days_left is not None and days_left <= 3) else
        "warning" if (days_left is not None and days_left <= 7) else "normal"
    )
    return {
        "id": str(notice.id),
        "file_name": notice.file_name,
        "notice_type": notice.notice_type,
        "gstin": notice.gstin,
        "taxpayer_name": notice.taxpayer_name,
        "notice_number": notice.notice_number,
        "notice_date": notice.notice_date,
        "deadline": notice.deadline,
        "days_left": days_left,
        "urgency": urgency,
        "demand_amount_inr": notice.demand_amount_inr,
        "period": notice.period,
        "issues": json.loads(notice.issues_json or "[]"),
        "issuing_authority": notice.issuing_authority,
        "extraction_confidence": notice.extraction_confidence,
        "field_sources": json.loads(notice.field_sources_json or "{}"),
        "ca_orientation": json.loads(notice.ca_orientation_json) if notice.ca_orientation_json else None,
        "status": notice.status,
        "created_at": notice.created_at.isoformat() if notice.created_at else None,
    }


@router.post("/notices/upload")
async def upload_notice(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _require_paid(user)
    content = await file.read()
    fname = file.filename or "notice.pdf"

    if fname.lower().endswith(".pdf"):
        raw_text = _extract_pdf_text(content)
    else:
        raw_text = content.decode("utf-8", errors="replace")

    if not raw_text.strip():
        raise HTTPException(status_code=422, detail="Could not extract text. Upload a readable PDF or text file.")

    extracted = gst_ai.extract_notice(raw_text)

    notice = GSTNotice(
        user_id=user.id,
        file_name=fname,
        raw_text=raw_text[:50000],
        notice_type=extracted.get("notice_type"),
        gstin=extracted.get("gstin"),
        taxpayer_name=extracted.get("taxpayer_name"),
        notice_number=extracted.get("notice_number"),
        notice_date=extracted.get("notice_date"),
        deadline=extracted.get("deadline"),
        demand_amount_inr=extracted.get("demand_amount_inr"),
        period=extracted.get("period"),
        issues_json=json.dumps(extracted.get("issues", [])),
        issuing_authority=extracted.get("issuing_authority"),
        extraction_confidence=extracted.get("confidence", "low"),
        field_sources_json=json.dumps(extracted.get("field_sources", {})),
        status="draft",
    )
    db.add(notice)
    db.flush()
    notice_id = str(notice.id)

    background_tasks.add_task(_bg_save_draft, notice_id, extracted)
    background_tasks.add_task(_bg_save_orientation, notice_id, extracted)

    db.commit()
    db.refresh(notice)
    return _notice_dict(notice)


def _bg_save_draft(notice_id: str, extracted: dict):
    from app.core.database import SessionLocal
    db = SessionLocal()
    try:
        notice = db.query(GSTNotice).filter(GSTNotice.id == notice_id).first()
        if not notice:
            return
        result = gst_ai.generate_draft_reply(
            notice_type=extracted.get("notice_type", "unknown"),
            notice_number=extracted.get("notice_number"),
            notice_date=extracted.get("notice_date"),
            gstin=extracted.get("gstin"),
            taxpayer_name=extracted.get("taxpayer_name"),
            period=extracted.get("period"),
            demand_amount_inr=extracted.get("demand_amount_inr"),
            issues=extracted.get("issues", []),
        )
        draft = GSTDraft(
            notice_id=notice_id,
            draft_text=result["draft_text"],
            version=1,
            cai_critique_notes=result.get("cai_notes"),
            cai_revised=result.get("cai_revised", False),
            draft_figures_json=json.dumps(result.get("draft_figures", [])),
        )
        db.add(draft)
        db.commit()
    except Exception as exc:
        logger.error("Draft save failed for notice %s: %s", notice_id, exc)
    finally:
        db.close()


def _bg_save_orientation(notice_id: str, extracted: dict):
    from app.core.database import SessionLocal
    db = SessionLocal()
    try:
        orientation = gst_ai.generate_ca_orientation(
            notice_type=extracted.get("notice_type"),
            issues=extracted.get("issues", []),
            period=extracted.get("period"),
            demand_amount_inr=extracted.get("demand_amount_inr"),
        )
        notice = db.query(GSTNotice).filter(GSTNotice.id == notice_id).first()
        if notice:
            notice.ca_orientation_json = json.dumps(orientation)
            db.commit()
    except Exception as exc:
        logger.error("Orientation save failed for notice %s: %s", notice_id, exc)
    finally:
        db.close()


@router.get("/notices")
def list_notices(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _require_paid(user)
    notices = (
        db.query(GSTNotice)
        .filter(GSTNotice.user_id == user.id)
        .order_by(GSTNotice.created_at.desc())
        .all()
    )
    result = [_notice_dict(n) for n in notices]
    order = {"overdue": 0, "critical": 1, "warning": 2, "normal": 3}
    result.sort(key=lambda x: (order.get(x["urgency"], 9), x.get("days_left") or 9999))
    return result


@router.get("/notices/{notice_id}")
def get_notice(notice_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _require_paid(user)
    notice = db.query(GSTNotice).filter(GSTNotice.id == notice_id, GSTNotice.user_id == user.id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    data = _notice_dict(notice)
    drafts = db.query(GSTDraft).filter(GSTDraft.notice_id == notice_id).order_by(GSTDraft.version.desc()).all()
    data["drafts"] = [
        {
            "id": str(d.id),
            "version": d.version,
            "draft_text": d.draft_text,
            "accepted": d.accepted,
            "cai_revised": d.cai_revised or False,
            "cai_notes": d.cai_critique_notes,
            "draft_figures": json.loads(d.draft_figures_json or "[]"),
            "created_at": d.created_at.isoformat() if d.created_at else None,
        }
        for d in drafts
    ]
    return data


@router.post("/notices/{notice_id}/regenerate-draft")
def regenerate_draft(notice_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _require_paid(user)
    notice = db.query(GSTNotice).filter(GSTNotice.id == notice_id, GSTNotice.user_id == user.id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    issues = json.loads(notice.issues_json or "[]")
    result = gst_ai.generate_draft_reply(
        notice_type=notice.notice_type or "unknown",
        notice_number=notice.notice_number,
        notice_date=notice.notice_date,
        gstin=notice.gstin,
        taxpayer_name=notice.taxpayer_name,
        period=notice.period,
        demand_amount_inr=notice.demand_amount_inr,
        issues=issues,
    )
    version = db.query(GSTDraft).filter(GSTDraft.notice_id == notice_id).count() + 1
    draft = GSTDraft(
        notice_id=notice_id,
        draft_text=result["draft_text"],
        version=version,
        cai_critique_notes=result.get("cai_notes"),
        cai_revised=result.get("cai_revised", False),
        draft_figures_json=json.dumps(result.get("draft_figures", [])),
    )
    db.add(draft)
    db.commit()
    db.refresh(draft)
    return {
        "id": str(draft.id),
        "version": draft.version,
        "draft_text": draft.draft_text,
        "cai_revised": draft.cai_revised,
        "draft_figures": json.loads(draft.draft_figures_json or "[]"),
    }


@router.post("/notices/{notice_id}/accept-draft/{draft_id}")
def accept_draft(notice_id: str, draft_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _require_paid(user)
    notice = db.query(GSTNotice).filter(GSTNotice.id == notice_id, GSTNotice.user_id == user.id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    draft = db.query(GSTDraft).filter(GSTDraft.id == draft_id, GSTDraft.notice_id == notice_id).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    draft.accepted = True
    draft.accepted_at = datetime.utcnow()
    notice.status = "reviewed"
    issues = json.loads(notice.issues_json or "[]")
    db.add(GSTCorpus(
        notice_type=notice.notice_type,
        issue_count=len(issues),
        cai_passed=not draft.cai_revised,
        cai_revised=draft.cai_revised or False,
    ))
    db.commit()
    return {"ok": True}


@router.post("/notices/{notice_id}/mark-filed")
def mark_filed(notice_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _require_paid(user)
    notice = db.query(GSTNotice).filter(GSTNotice.id == notice_id, GSTNotice.user_id == user.id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    notice.status = "filed"
    db.commit()
    return {"ok": True}
