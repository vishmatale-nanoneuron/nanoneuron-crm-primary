import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.core.database import Base, engine
from app.models import models
from app.api import auth, reports, insights

logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)


def _run_migrations() -> None:
    """Idempotent column additions — runs on every startup, safe to re-run."""
    stmts = [
        "ALTER TABLE ops_reports ADD COLUMN IF NOT EXISTS industry VARCHAR(50)",
        "ALTER TABLE ops_insights ADD COLUMN IF NOT EXISTS industry_detected VARCHAR(50)",
        "ALTER TABLE ops_insights ADD COLUMN IF NOT EXISTS cost_impact_usd INTEGER DEFAULT 0",
        "ALTER TABLE ops_insights ADD COLUMN IF NOT EXISTS vertical_ai_score INTEGER DEFAULT 0",
        "ALTER TABLE ops_insights ADD COLUMN IF NOT EXISTS annual_savings_usd INTEGER DEFAULT 0",
    ]
    try:
        with engine.connect() as conn:
            for stmt in stmts:
                conn.execute(text(stmt))
            conn.commit()
    except Exception as exc:
        logger.warning("Migration warning (non-fatal): %s", exc)


_run_migrations()

app = FastAPI(title="OpsOracle AI API", version="2.0.0", redirect_slashes=False)

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


@app.get("/health")
def health():
    return {"status": "ok", "product": "OpsOracle AI", "version": "2.0.0"}
