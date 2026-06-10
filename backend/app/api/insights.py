from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import IndustryBenchmark, Insight, Report
from app.schemas.schemas import BenchmarkResponse
from app.api.deps import get_current_user
from app.models.models import User

router = APIRouter(prefix="/insights", tags=["insights"])

UPGRADE_MSG = "Industry benchmarks and trend analytics require OpsOracle Pro (₹999/month). Upgrade at /pricing."


def _require_pro(user: User) -> None:
    if (user.plan_tier or "free") not in ("pro", "enterprise"):
        raise HTTPException(status_code=402, detail=UPGRADE_MSG)


@router.get("/benchmarks", response_model=list[BenchmarkResponse])
def list_benchmarks(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _require_pro(user)
    rows = db.query(IndustryBenchmark).filter(IndustryBenchmark.report_count > 0).all()
    result = []
    for r in rows:
        result.append(BenchmarkResponse(
            industry=r.industry,
            avg_risk_score=round(r.sum_risk_score / r.report_count, 1),
            avg_delay_probability=round(r.sum_delay_probability / r.report_count, 1),
            avg_inventory_risk=round(r.sum_inventory_risk / r.report_count, 1),
            report_count=r.report_count,
        ))
    return result


@router.get("/dashboard-stats")
def dashboard_stats(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _require_pro(user)
    """Returns user's risk trend over last 10 reports — powers the data flywheel UX."""
    reports = (
        db.query(Report)
        .filter(Report.user_id == user.id)
        .order_by(Report.created_at.desc())
        .limit(10)
        .all()
    )
    trend = []
    for rep in reversed(reports):
        latest_insight = (
            db.query(Insight)
            .filter(Insight.report_id == rep.id)
            .order_by(Insight.created_at.desc())
            .first()
        )
        if latest_insight:
            trend.append({
                "report_id": str(rep.id),
                "file_name": rep.file_name,
                "industry": rep.industry or latest_insight.industry_detected,
                "risk_score": latest_insight.risk_score,
                "delay_probability": latest_insight.delay_probability,
                "inventory_risk": latest_insight.inventory_risk,
                "cost_impact_usd": latest_insight.cost_impact_usd or 0,
                "date": rep.created_at.isoformat(),
            })
    total_cost_at_risk = sum(t["cost_impact_usd"] for t in trend)
    avg_risk = round(sum(t["risk_score"] for t in trend) / len(trend), 1) if trend else 0
    return {
        "trend": trend,
        "total_reports": len(trend),
        "avg_risk_score": avg_risk,
        "total_cost_at_risk_usd": total_cost_at_risk,
    }
