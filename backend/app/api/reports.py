from datetime import datetime
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Report, Insight, User, IndustryBenchmark
from app.schemas.schemas import ReportResponse, InsightResponse
from app.api.deps import get_current_user
from app.services.file_parser import parse_uploaded_file
from app.services.ai_service import analyze_operations

router = APIRouter(prefix="/reports", tags=["reports"])

DAILY_FREE_LIMIT = 3


def _today_start() -> datetime:
    now = datetime.utcnow()
    return now.replace(hour=0, minute=0, second=0, microsecond=0)


def _daily_used(db: Session, user_id) -> int:
    return db.query(Report).filter(
        Report.user_id == user_id,
        Report.created_at >= _today_start(),
    ).count()


def _check_daily_limit(user: User, db: Session) -> None:
    if (user.plan_tier or "free") != "free":
        return
    used = _daily_used(db, user.id)
    if used >= DAILY_FREE_LIMIT:
        raise HTTPException(
            status_code=429,
            detail=f"You've used all {DAILY_FREE_LIMIT} free reports for today. Upgrade to Pro for unlimited uploads.",
        )


def _update_benchmark(db: Session, industry: str, risk: int, delay: int, inventory: int) -> None:
    bench = db.query(IndustryBenchmark).filter(IndustryBenchmark.industry == industry).first()
    if bench:
        bench.sum_risk_score += risk
        bench.sum_delay_probability += delay
        bench.sum_inventory_risk += inventory
        bench.report_count += 1
    else:
        bench = IndustryBenchmark(
            industry=industry,
            sum_risk_score=risk,
            sum_delay_probability=delay,
            sum_inventory_risk=inventory,
            report_count=1,
        )
        db.add(bench)


@router.get("/usage")
def daily_usage(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    tier = user.plan_tier or "free"
    if tier != "free":
        return {"plan_tier": tier, "used": 0, "limit": None, "unlimited": True, "remaining": None}
    used = _daily_used(db, user.id)
    remaining = max(0, DAILY_FREE_LIMIT - used)
    return {"plan_tier": tier, "used": used, "limit": DAILY_FREE_LIMIT, "unlimited": False, "remaining": remaining}


@router.post("/upload", response_model=InsightResponse)
async def upload_report(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _check_daily_limit(user, db)
    content = await file.read()
    try:
        text, rows_count = parse_uploaded_file(file.filename, content)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    result = analyze_operations(text)
    industry = result.get("industry_detected", "operations")

    report = Report(
        user_id=user.id,
        file_name=file.filename,
        file_type=file.content_type,
        extracted_text=text,
        rows_count=rows_count,
        industry=industry,
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    insight = Insight(
        report_id=report.id,
        risk_score=int(result.get("risk_score", 0)),
        delay_probability=int(result.get("delay_probability", 0)),
        inventory_risk=int(result.get("inventory_risk", 0)),
        bottleneck_summary=result.get("bottleneck_summary", ""),
        executive_summary=result.get("executive_summary", ""),
        recommendations=result.get("recommendations", ""),
        industry_detected=industry,
        cost_impact_usd=int(result.get("cost_impact_usd", 0)),
        vertical_ai_score=int(result.get("vertical_ai_score", 0)),
        annual_savings_usd=int(result.get("annual_savings_usd", 0)),
    )
    db.add(insight)

    _update_benchmark(
        db, industry,
        insight.risk_score, insight.delay_probability, insight.inventory_risk,
    )

    db.commit()
    db.refresh(insight)
    return insight


@router.get("", response_model=list[ReportResponse])
@router.get("/", response_model=list[ReportResponse], include_in_schema=False)
def list_reports(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Report).filter(Report.user_id == user.id).order_by(Report.created_at.desc()).all()


@router.get("/{report_id}", response_model=ReportResponse)
def get_report(report_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == user.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.get("/{report_id}/insights", response_model=list[InsightResponse])
def report_insights(report_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == user.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return db.query(Insight).filter(Insight.report_id == report.id).order_by(Insight.created_at.desc()).all()
