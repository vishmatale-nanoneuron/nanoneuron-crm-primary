import secrets
import uuid as _uuid
from datetime import datetime
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.exc import DataError
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.models import Report, Insight, User, IndustryBenchmark
from app.schemas.schemas import (
    ReportResponse, InsightResponse, ResolveRequest,
    PublicDemoResponse, SharedReportResponse,
)
from app.api.deps import get_current_user
from app.services.file_parser import parse_uploaded_file
from app.services.ai_service import analyze_operations, classify_sub_vertical

router = APIRouter(prefix="/reports", tags=["reports"])

DAILY_FREE_LIMIT = 3
_DEMO_CACHE: dict[str, dict] = {}  # in-memory per-industry cache for public demo


def _compute_baseline(db: Session, user_id, industry: str, current_risk: int) -> tuple[int | None, str | None]:
    """Fix 3 — Alibaba data moat: compare current analysis vs user's historical baseline.
    Queries last 3 insights for the same user + industry. Returns (risk_delta, comparison_text).
    """
    prev = (
        db.query(Insight)
        .join(Report, Insight.report_id == Report.id)
        .filter(Report.user_id == user_id, Insight.industry_detected == industry)
        .order_by(Insight.created_at.desc())
        .limit(3)
        .all()
    )
    if not prev:
        return None, None
    avg_risk = round(sum(i.risk_score for i in prev) / len(prev))
    delta = current_risk - avg_risk
    count = len(prev)
    period = "your last analysis" if count == 1 else f"your last {count} analyses"
    label = industry.replace("_", " ")
    if delta > 5:
        text = f"↑ Risk up +{delta} pts vs {period} (avg {avg_risk}) — {label} operations deteriorating"
    elif delta < -5:
        text = f"↓ Risk down {abs(delta)} pts vs {period} (avg {avg_risk}) — {label} operations improving"
    else:
        text = f"→ Risk stable vs {period} (avg {avg_risk}) — {label} operations holding steady"
    return delta, text

DEMO_SAMPLES = {
    "logistics": """Shipment ID,Origin,Destination,Carrier,Scheduled Date,Actual Date,Status,Weight_kg,Cost_INR
SH-1001,Mumbai,Delhi,BlueDart,2026-06-01,2026-06-04,Delayed,120,4200
SH-1002,Chennai,Bangalore,DTDC,2026-06-01,2026-06-01,Delivered,45,1800
SH-1003,Mumbai,Pune,Delhivery,2026-06-02,2026-06-06,Delayed,200,3100
SH-1004,Delhi,Kolkata,FedEx,2026-06-02,2026-06-02,Delivered,80,5600
SH-1005,Mumbai,Delhi,BlueDart,2026-06-03,,Pending,150,4800
SH-1006,Hyderabad,Chennai,DTDC,2026-06-03,2026-06-07,Delayed,60,2200
SH-1007,Mumbai,Delhi,BlueDart,2026-06-04,,Pending,300,9100
SH-1008,Bangalore,Mumbai,Delhivery,2026-06-04,2026-06-04,Delivered,90,3300
SH-1009,Mumbai,Delhi,BlueDart,2026-06-05,,Pending,110,3900
SH-1010,Chennai,Delhi,FedEx,2026-06-05,2026-06-09,Delayed,175,7200
SH-1011,Mumbai,Pune,DTDC,2026-06-05,,Pending,55,1900
SH-1012,Delhi,Mumbai,BlueDart,2026-06-06,,Pending,220,6800""",

    "manufacturing": """Machine,Shift,Start Time,End Time,Planned Output,Actual Output,Downtime_mins,Defects,Operator,Reason
M1-Press,Morning,06:00,14:00,500,487,12,8,Raj Kumar,Setup delay
M2-Lathe,Morning,06:00,14:00,300,190,95,22,Suresh P,Breakdown
M3-Weld,Morning,06:00,14:00,400,395,5,3,Amit S,None
M2-Lathe,Afternoon,14:00,22:00,300,145,110,31,Vikram T,Breakdown
M4-Grind,Morning,06:00,14:00,600,598,3,1,Priya R,None
M1-Press,Afternoon,14:00,22:00,500,460,18,12,Mohan L,Material wait
M5-CNC,Morning,06:00,14:00,200,198,4,0,Anita K,None
M2-Lathe,Night,22:00,06:00,300,80,155,40,Deepak J,Breakdown
M3-Weld,Afternoon,14:00,22:00,400,388,9,5,Kiran M,None
M6-Paint,Morning,06:00,14:00,350,290,45,18,Sunita B,Spray nozzle fault""",

    "warehouse": """SKU,Product Name,Category,Current Stock,Reorder Point,Daily Demand,Lead Time Days,Last Restock,Warehouse Zone
SKU-101,Bearings 6204,Mechanical,45,100,18,7,2026-05-20,A1
SKU-102,Safety Gloves L,PPE,320,50,12,3,2026-06-05,B2
SKU-103,Motor 0.5HP,Electrical,3,15,2,14,2026-05-01,C1
SKU-104,Lubricant 5L,Consumable,8,30,5,5,2026-05-28,B1
SKU-105,Conveyor Belt 2m,Mechanical,0,5,1,21,2026-04-15,C2
SKU-106,Nuts M10 (100pk),Fasteners,1200,200,45,3,2026-06-08,A2
SKU-107,PLC Controller,Electronics,2,4,0,30,2026-03-10,C1
SKU-108,Work Gloves M,PPE,15,40,8,3,2026-06-01,B2
SKU-109,Drill Bit Set,Tools,60,20,3,5,2026-06-03,A3
SKU-110,Transformer 5KVA,Electrical,1,3,0,45,2026-02-20,C1""",

    "retail": """Store,SKU,Product,Category,Current_Stock,Weekly_Sales,Forecast_Sales,Sell_Through_Pct,Returns,Last_Restocked,Days_Until_Stockout
STORE-MUM,SKU-201,iPhone 15 Case Black,Accessories,12,45,50,88,3,2026-06-01,1
STORE-MUM,SKU-202,Samsung Galaxy Charger,Electronics,0,28,30,100,2,2026-05-20,0
STORE-DEL,SKU-203,Summer Dress Red,Apparel,145,8,25,32,18,2026-06-05,18
STORE-DEL,SKU-204,Running Shoes Size 9,Footwear,3,22,24,88,1,2026-06-07,1
STORE-BLR,SKU-205,Coffee Maker 1L,Kitchen,67,4,5,80,9,2026-06-01,16
STORE-MUM,SKU-206,Yoga Mat Premium,Sports,0,15,18,100,0,2026-05-15,0
STORE-DEL,SKU-207,LED Monitor 24in,Electronics,8,12,14,86,2,2026-05-28,4
STORE-BLR,SKU-208,Winter Jacket L,Apparel,220,2,3,67,31,2026-06-08,110
STORE-MUM,SKU-209,Protein Powder 1kg,Health,5,32,35,91,1,2026-06-05,1
STORE-DEL,SKU-210,Bluetooth Speaker,Electronics,0,19,22,100,4,2026-05-22,0
STORE-BLR,SKU-211,Running Shoes Size 10,Footwear,1,18,20,90,0,2026-06-06,0
STORE-MUM,SKU-212,Desk Lamp LED,Home,89,3,4,75,6,2026-06-03,29""",

    "supply_chain": """Supplier,Part,Category,Lead_Time_Days,Promised_Lead_Days,OTD_Pct,Current_Stock,Safety_Stock,Reorder_Point,Open_POs,PO_Value_INR,Risk
TechComp India,PCB-A1,Electronics,21,14,62,120,200,300,2,480000,HIGH
SteelWorks Pune,Shaft-B2,Mechanical,8,7,91,450,100,150,0,,LOW
ChemSupply Mumbai,Adhesive-C3,Chemical,35,21,44,8,50,100,1,85000,CRITICAL
AutoParts Delhi,Bearing-D4,Mechanical,12,10,78,95,80,120,1,42000,MEDIUM
PlasticMold Ahmedabad,Housing-E5,Plastics,18,14,55,30,40,80,2,156000,HIGH
ImportComp China,Sensor-F6,Electronics,45,30,38,2,20,30,1,220000,CRITICAL
FiberTex Surat,Cable-G7,Electrical,7,5,87,680,100,150,0,,LOW
PCBFab Bangalore,Module-H8,Electronics,28,21,66,55,60,90,1,95000,MEDIUM
FastenersCo Nashik,Bolt-I9,Fasteners,4,3,94,2400,500,600,0,,LOW
MotorSupply Coimbatore,Motor-J10,Electrical,22,18,51,6,15,25,1,185000,HIGH""",

    "mlops": """Date,Model,Type,Status,Accuracy_Pct,Latency_P99_Ms,Data_Drift_Score,Retraining_Required,Issue
2026-06-01,fraud-detector,inference,HEALTHY,94.2,45,0.04,NO,
2026-06-02,churn-predictor,training,FAILED,,,0.51,YES,Training data 38pct null values
2026-06-03,fraud-detector,inference,DEGRADED,87.1,112,0.34,YES,Accuracy dropped below 90pct threshold
2026-06-03,recommendation-engine,inference,HEALTHY,91.5,28,0.07,NO,
2026-06-04,fraud-detector,retraining,SUCCESS,93.8,48,0.06,NO,
2026-06-05,churn-predictor,training,FAILED,,,0.62,YES,Feature store stale 72hr upstream data lag
2026-06-05,pricing-model,inference,DEGRADED,79.3,890,0.61,YES,P99 latency SLA breach 890ms vs 200ms target
2026-06-06,pricing-model,retraining,SUCCESS,88.1,210,0.14,NO,
2026-06-07,churn-predictor,training,SUCCESS,89.4,67,0.09,NO,
2026-06-07,fraud-detector,inference,HEALTHY,93.9,44,0.05,NO,
2026-06-08,recommendation-engine,inference,DEGRADED,84.2,310,0.42,YES,CTR dropped 18pct feature drift detected
2026-06-08,pricing-model,inference,HEALTHY,87.9,195,0.11,NO,""",

    "devops": """Date,Service,Type,Status,Duration_Mins,Severity,Root_Cause,Rollback_Required,MTTR_Mins
2026-06-01,payment-service,deploy,SUCCESS,12,,,NO,
2026-06-02,auth-service,deploy,FAILED,8,,,YES,
2026-06-02,auth-service,incident,P1,,Login failures 40pct users,Failed deploy v1.8.0,YES,150
2026-06-03,api-gateway,deploy,FAILED,22,,,YES,
2026-06-03,api-gateway,incident,P1,,502 errors 100pct traffic,Failed release deploy,YES,100
2026-06-03,api-gateway,deploy,SUCCESS,14,,,NO,
2026-06-04,user-service,deploy,SUCCESS,9,,,NO,
2026-06-05,notification-service,deploy,FAILED,18,,,YES,
2026-06-05,notification-service,incident,P2,,Email delivery 2hr delay,Bad hotfix deploy,,140
2026-06-05,notification-service,deploy,SUCCESS,11,,,NO,
2026-06-06,payment-service,deploy,FAILED,25,,,YES,
2026-06-06,payment-service,incident,P1,,Payment processing down,Deploy regression,,105
2026-06-07,auth-service,deploy,SUCCESS,10,,,NO,
2026-06-07,monitoring-service,deploy,SUCCESS,7,,,NO,"""
}


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


def _update_benchmark(db: Session, industry: str, risk: int, delay: int, inventory: int) -> int:
    """Update anonymized industry benchmark and return the new report_count."""
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
    return bench.report_count


# ── Public endpoints (no auth) — must come before /{report_id} ──────────────

@router.get("/public-demo", response_model=PublicDemoResponse)
def public_demo(industry: str = "logistics"):
    """Public live demo — no login needed. Result cached per industry in memory."""
    industry = industry if industry in DEMO_SAMPLES else "logistics"
    if industry not in _DEMO_CACHE:
        text = DEMO_SAMPLES[industry]
        result = analyze_operations(text)
        result["industry"] = industry
        _DEMO_CACHE[industry] = result
    return _DEMO_CACHE[industry]


@router.get("/shared/{share_token}", response_model=SharedReportResponse)
def get_shared_report(share_token: str, db: Session = Depends(get_db)):
    """Public shared report view — no auth required. Never exposes user or raw data."""
    report = db.query(Report).filter(Report.share_token == share_token).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found or link has expired")
    insight = (
        db.query(Insight)
        .filter(Insight.report_id == report.id)
        .order_by(Insight.created_at.desc())
        .first()
    )
    if not insight:
        raise HTTPException(status_code=404, detail="No analysis found for this report")
    return SharedReportResponse(
        file_name=report.file_name,
        industry=report.industry,
        rows_count=report.rows_count or 0,
        created_at=report.created_at,
        insight=insight,
    )


# ── Auth-required endpoints ──────────────────────────────────────────────────

@router.get("/demo", response_model=InsightResponse)
def demo_analysis(
    industry: str = "logistics",
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    industry = industry if industry in DEMO_SAMPLES else "logistics"
    text = DEMO_SAMPLES[industry]
    result = analyze_operations(text)
    detected_industry = result.get("industry_detected", industry)
    sub_vertical = result.get("sub_vertical") or classify_sub_vertical(detected_industry, text)
    is_premium = (user.plan_tier or "free") in ("pro", "enterprise")

    report = Report(
        user_id=user.id,
        file_name=f"demo_{industry}_sample.csv",
        file_type="text/csv",
        extracted_text=text,
        rows_count=len(text.strip().split("\n")) - 1,
        industry=detected_industry,
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    benchmark_count = _update_benchmark(
        db, detected_industry,
        int(result.get("risk_score", 0)),
        int(result.get("delay_probability", 0)),
        int(result.get("inventory_risk", 0)),
    )

    current_risk = int(result.get("risk_score", 0))
    risk_delta, baseline_comparison = _compute_baseline(db, user.id, detected_industry, current_risk)

    insight = Insight(
        report_id=report.id,
        risk_score=current_risk,
        delay_probability=int(result.get("delay_probability", 0)),
        inventory_risk=int(result.get("inventory_risk", 0)),
        bottleneck_summary=result.get("bottleneck_summary", ""),
        executive_summary=result.get("executive_summary", ""),
        recommendations=result.get("recommendations", ""),
        industry_detected=detected_industry,
        sub_vertical=sub_vertical,
        cost_impact_usd=int(result.get("cost_impact_usd", 0)),
        vertical_ai_score=int(result.get("vertical_ai_score", 0)),
        annual_savings_usd=int(result.get("annual_savings_usd", 0)),
        benchmark_count=benchmark_count,
        agi_analysis=is_premium,
        analysis_method=result.get("analysis_method", "llm_groq"),
        risk_delta=risk_delta,
        baseline_comparison=baseline_comparison,
        recommendations_json=result.get("recommendations_json"),
        evidence=result.get("evidence"),
        confidence_level=result.get("confidence_level"),
        data_quality_issues=result.get("data_quality_issues"),
        agi_reasoning=result.get("agi_reasoning"),
    )
    db.add(insight)
    db.commit()
    db.refresh(insight)
    return insight


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
    sub_vertical = result.get("sub_vertical") or classify_sub_vertical(industry, text)
    is_premium = (user.plan_tier or "free") in ("pro", "enterprise")

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

    benchmark_count = _update_benchmark(
        db, industry,
        int(result.get("risk_score", 0)),
        int(result.get("delay_probability", 0)),
        int(result.get("inventory_risk", 0)),
    )

    current_risk = int(result.get("risk_score", 0))
    risk_delta, baseline_comparison = _compute_baseline(db, user.id, industry, current_risk)

    insight = Insight(
        report_id=report.id,
        risk_score=current_risk,
        delay_probability=int(result.get("delay_probability", 0)),
        inventory_risk=int(result.get("inventory_risk", 0)),
        bottleneck_summary=result.get("bottleneck_summary", ""),
        executive_summary=result.get("executive_summary", ""),
        recommendations=result.get("recommendations", ""),
        industry_detected=industry,
        sub_vertical=sub_vertical,
        cost_impact_usd=int(result.get("cost_impact_usd", 0)),
        vertical_ai_score=int(result.get("vertical_ai_score", 0)),
        annual_savings_usd=int(result.get("annual_savings_usd", 0)),
        benchmark_count=benchmark_count,
        agi_analysis=is_premium,
        analysis_method=result.get("analysis_method", "llm_groq"),
        risk_delta=risk_delta,
        baseline_comparison=baseline_comparison,
        recommendations_json=result.get("recommendations_json"),
        evidence=result.get("evidence"),
        confidence_level=result.get("confidence_level"),
        data_quality_issues=result.get("data_quality_issues"),
        agi_reasoning=result.get("agi_reasoning"),
    )
    db.add(insight)
    db.commit()
    db.refresh(insight)
    return insight


@router.get("", response_model=list[ReportResponse])
@router.get("/", response_model=list[ReportResponse], include_in_schema=False)
def list_reports(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Report).filter(Report.user_id == user.id).order_by(Report.created_at.desc()).all()


@router.get("/{report_id}", response_model=ReportResponse)
def get_report(report_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    try:
        report = db.query(Report).filter(Report.id == report_id, Report.user_id == user.id).first()
    except DataError:
        db.rollback()
        raise HTTPException(status_code=404, detail="Report not found")
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.get("/{report_id}/insights", response_model=list[InsightResponse])
def report_insights(report_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    try:
        report = db.query(Report).filter(Report.id == report_id, Report.user_id == user.id).first()
    except DataError:
        db.rollback()
        raise HTTPException(status_code=404, detail="Report not found")
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return db.query(Insight).filter(Insight.report_id == report.id).order_by(Insight.created_at.desc()).all()


@router.post("/{report_id}/insights/{insight_id}/resolve", response_model=InsightResponse)
def resolve_insight(
    report_id: str,
    insight_id: str,
    body: ResolveRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Kai-Fu Lee Action-Feedback Loop: mark an insight as resolved."""
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == user.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    insight = db.query(Insight).filter(Insight.id == insight_id, Insight.report_id == report.id).first()
    if not insight:
        raise HTTPException(status_code=404, detail="Insight not found")
    insight.resolved_at = datetime.utcnow()
    insight.resolution_note = body.note or None
    db.commit()
    db.refresh(insight)
    return insight


@router.post("/{report_id}/insights/{insight_id}/mark-reviewed", response_model=InsightResponse)
def mark_expert_reviewed(
    report_id: str,
    insight_id: str,
    secret: str,
    db: Session = Depends(get_db),
):
    """Enterprise: admin marks insight as expert-reviewed (requires ADMIN_SECRET)."""
    admin_secret = getattr(settings, "ADMIN_SECRET", "")
    if not admin_secret or secret != admin_secret:
        raise HTTPException(status_code=403, detail="Invalid secret")
    insight = db.query(Insight).filter(Insight.id == insight_id, Insight.report_id == report_id).first()
    if not insight:
        raise HTTPException(status_code=404, detail="Insight not found")
    insight.expert_reviewed = True
    db.commit()
    db.refresh(insight)
    return insight


@router.post("/{report_id}/share")
def share_report(
    report_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Generate a public share link for a report. Idempotent — repeated calls return the same token."""
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == user.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if not report.share_token:
        report.share_token = secrets.token_urlsafe(9)  # 12 URL-safe chars
        db.commit()
    return {
        "share_token": report.share_token,
        "share_url": f"{settings.APP_URL}/shared/{report.share_token}",
    }
