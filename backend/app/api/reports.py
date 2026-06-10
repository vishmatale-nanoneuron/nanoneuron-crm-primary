from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Report, Insight, User
from app.schemas.schemas import ReportResponse, InsightResponse
from app.api.deps import get_current_user
from app.services.file_parser import parse_uploaded_file
from app.services.ai_service import analyze_operations

router = APIRouter(prefix="/reports", tags=["reports"])

@router.post("/upload", response_model=InsightResponse)
async def upload_report(file: UploadFile = File(...), db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    content = await file.read()
    try:
        text, rows_count = parse_uploaded_file(file.filename, content)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    report = Report(user_id=user.id, file_name=file.filename, file_type=file.content_type, extracted_text=text, rows_count=rows_count)
    db.add(report)
    db.commit()
    db.refresh(report)
    result = analyze_operations(text)
    insight = Insight(
        report_id=report.id,
        risk_score=int(result.get("risk_score", 0)),
        delay_probability=int(result.get("delay_probability", 0)),
        inventory_risk=int(result.get("inventory_risk", 0)),
        bottleneck_summary=result.get("bottleneck_summary", ""),
        executive_summary=result.get("executive_summary", ""),
        recommendations=result.get("recommendations", ""),
    )
    db.add(insight)
    db.commit()
    db.refresh(insight)
    return insight

@router.get("", response_model=list[ReportResponse])
def list_reports(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Report).filter(Report.user_id == user.id).order_by(Report.created_at.desc()).all()

@router.get("/{report_id}/insights", response_model=list[InsightResponse])
def report_insights(report_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == user.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return db.query(Insight).filter(Insight.report_id == report.id).order_by(Insight.created_at.desc()).all()
