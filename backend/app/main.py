import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.core.database import Base, engine
from app.models import models
from app.api import auth, reports, insights, payments, digest

logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)


def _run_migrations() -> None:
    """Idempotent column additions — runs on every startup, safe to re-run."""
    stmts = [
        # Original migrations
        "ALTER TABLE ops_reports ADD COLUMN IF NOT EXISTS industry VARCHAR(50)",
        "ALTER TABLE ops_insights ADD COLUMN IF NOT EXISTS industry_detected VARCHAR(50)",
        "ALTER TABLE ops_insights ADD COLUMN IF NOT EXISTS cost_impact_usd INTEGER DEFAULT 0",
        "ALTER TABLE ops_insights ADD COLUMN IF NOT EXISTS vertical_ai_score INTEGER DEFAULT 0",
        "ALTER TABLE ops_insights ADD COLUMN IF NOT EXISTS annual_savings_usd INTEGER DEFAULT 0",
        "ALTER TABLE ops_users ADD COLUMN IF NOT EXISTS plan_tier VARCHAR(20) DEFAULT 'free'",
        # Kai-Fu Lee: sub-vertical depth, feedback loop, expert trust, flywheel visibility
        "ALTER TABLE ops_insights ADD COLUMN IF NOT EXISTS sub_vertical VARCHAR(50)",
        "ALTER TABLE ops_insights ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP",
        "ALTER TABLE ops_insights ADD COLUMN IF NOT EXISTS resolution_note VARCHAR(500)",
        "ALTER TABLE ops_insights ADD COLUMN IF NOT EXISTS expert_reviewed BOOLEAN DEFAULT FALSE",
        "ALTER TABLE ops_insights ADD COLUMN IF NOT EXISTS benchmark_count INTEGER DEFAULT 0",
        # Monday Morning Email digest preference
        "ALTER TABLE ops_users ADD COLUMN IF NOT EXISTS email_digest BOOLEAN DEFAULT TRUE",
        "ALTER TABLE ops_users ADD COLUMN IF NOT EXISTS last_digest_sent_at TIMESTAMP",
        # Shareable report links + AGI premium tier
        "ALTER TABLE ops_reports ADD COLUMN IF NOT EXISTS share_token VARCHAR(20)",
        "ALTER TABLE ops_insights ADD COLUMN IF NOT EXISTS agi_analysis BOOLEAN DEFAULT FALSE",
        # Indexes
        "CREATE INDEX IF NOT EXISTS idx_ops_reports_user_id ON ops_reports(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_ops_insights_report_id ON ops_insights(report_id)",
        "CREATE INDEX IF NOT EXISTS idx_ops_subscriptions_user_id ON ops_subscriptions(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_ops_insights_unresolved ON ops_insights(report_id) WHERE resolved_at IS NULL",
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_ops_reports_share_token ON ops_reports(share_token) WHERE share_token IS NOT NULL",
        # Multi-gateway payment columns
        "ALTER TABLE ops_subscriptions ADD COLUMN IF NOT EXISTS gateway VARCHAR(20)",
        "ALTER TABLE ops_subscriptions ADD COLUMN IF NOT EXISTS gateway_order_id VARCHAR(100)",
        "ALTER TABLE ops_subscriptions ADD COLUMN IF NOT EXISTS gateway_payment_id VARCHAR(100)",
        # v3.9.0 card payments — Razorpay dedicated columns (idempotent)
        "ALTER TABLE ops_subscriptions ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100)",
        "ALTER TABLE ops_subscriptions ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(100)",
        # Fix 1: ByteDance telemetry — which engine produced this analysis
        "ALTER TABLE ops_insights ADD COLUMN IF NOT EXISTS analysis_method VARCHAR(20) DEFAULT 'llm_groq'",
        # Fix 3: Alibaba data moat — historical baseline comparison
        "ALTER TABLE ops_insights ADD COLUMN IF NOT EXISTS risk_delta INTEGER",
        "ALTER TABLE ops_insights ADD COLUMN IF NOT EXISTS baseline_comparison TEXT",
        # v3.5.0 world-class trust layer: evidence, real confidence, structured actions, data quality
        "ALTER TABLE ops_insights ADD COLUMN IF NOT EXISTS recommendations_json TEXT",
        "ALTER TABLE ops_insights ADD COLUMN IF NOT EXISTS evidence TEXT",
        "ALTER TABLE ops_insights ADD COLUMN IF NOT EXISTS confidence_level VARCHAR(20)",
        "ALTER TABLE ops_insights ADD COLUMN IF NOT EXISTS data_quality_issues TEXT",
        # v3.5.0 Vertical AGI: chain-of-thought reasoning trace
        "ALTER TABLE ops_insights ADD COLUMN IF NOT EXISTS agi_reasoning TEXT",
        # v3.6.0 Causal Chain: root cause → trigger → cascade → intervention window
        "ALTER TABLE ops_insights ADD COLUMN IF NOT EXISTS causal_chain TEXT",
        # v3.7.0 Trial expiry email idempotency flag
        "ALTER TABLE ops_users ADD COLUMN IF NOT EXISTS trial_warning_sent_at TIMESTAMP",
        # v3.8.0 Industry KPI benchmarking
        "ALTER TABLE ops_insights ADD COLUMN IF NOT EXISTS kpi_json TEXT",
        "ALTER TABLE ops_insights ADD COLUMN IF NOT EXISTS benchmark_comparison_json TEXT",
        "ALTER TABLE ops_industry_benchmarks ADD COLUMN IF NOT EXISTS kpi_sums_json TEXT",
    ]
    try:
        with engine.connect() as conn:
            for stmt in stmts:
                conn.execute(text(stmt))
            conn.commit()
    except Exception as exc:
        logger.warning("Migration warning (non-fatal): %s", exc)


_run_migrations()

app = FastAPI(title="OpsOracle AI API", version="3.9.0", redirect_slashes=False)

origins = [
    "https://nanoneuron.ai",
    "https://www.nanoneuron.ai",
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(reports.router)
app.include_router(insights.router)
app.include_router(payments.router)
app.include_router(digest.router)


@app.get("/health")
def health():
    return {"status": "ok", "product": "OpsOracle AI", "version": "3.8.0"}
