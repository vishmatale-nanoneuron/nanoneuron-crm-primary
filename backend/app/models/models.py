import uuid
from sqlalchemy import Column, String, Text, Integer, BigInteger, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "ops_users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    company_name = Column(String(255), nullable=False)
    plan_tier = Column(String(20), default="free", server_default="free")
    email_digest = Column(Boolean, default=True, server_default="true")
    risk_alerts = Column(Boolean, default=True, server_default="true")
    last_digest_sent_at = Column(DateTime, nullable=True)
    trial_warning_sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    reports = relationship("Report", back_populates="user", cascade="all, delete")
    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete")


class Report(Base):
    __tablename__ = "ops_reports"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("ops_users.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50))
    extracted_text = Column(Text)
    rows_count = Column(Integer, default=0)
    industry = Column(String(50))
    share_token = Column(String(20), nullable=True, unique=True)
    analysis_status = Column(String(20), default="done", server_default="done")  # queued|processing|done|failed
    analysis_error = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    user = relationship("User", back_populates="reports")
    insights = relationship("Insight", back_populates="report", cascade="all, delete")


class Insight(Base):
    __tablename__ = "ops_insights"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_id = Column(UUID(as_uuid=True), ForeignKey("ops_reports.id"), nullable=False)
    risk_score = Column(Integer, default=0)
    delay_probability = Column(Integer, default=0)
    inventory_risk = Column(Integer, default=0)
    bottleneck_summary = Column(Text)
    executive_summary = Column(Text)
    recommendations = Column(Text)
    industry_detected = Column(String(50))
    cost_impact_usd = Column(Integer, default=0)
    vertical_ai_score = Column(Integer, default=0)
    annual_savings_usd = Column(Integer, default=0)
    # Kai-Fu Lee principles: sub-vertical depth, feedback loop, expert trust, flywheel
    sub_vertical = Column(String(50), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    resolution_note = Column(String(500), nullable=True)
    expert_reviewed = Column(Boolean, default=False, server_default="false")
    benchmark_count = Column(Integer, default=0, server_default="0")
    agi_analysis = Column(Boolean, default=False, server_default="false")
    # ByteDance telemetry: track which engine produced the analysis
    analysis_method = Column(String(20), default="llm_groq", server_default="llm_groq")
    # Alibaba data moat: historical baseline comparison per org
    risk_delta = Column(Integer, nullable=True)
    baseline_comparison = Column(Text, nullable=True)
    # World-class trust layer: evidence, honest confidence, structured actions
    recommendations_json = Column(Text, nullable=True)   # JSON: [{timeframe,action,owner,impact,urgency}]
    evidence = Column(Text, nullable=True)               # JSON: ["specific row/pattern that drove each finding"]
    confidence_level = Column(String(20), nullable=True) # "high" | "medium" | "low" | "insufficient_data"
    data_quality_issues = Column(Text, nullable=True)    # JSON: ["what couldn't be assessed and why"]
    agi_reasoning = Column(Text, nullable=True)          # JSON: ["Step 1: ...", ..., "Step 5: ..."] — chain-of-thought
    causal_chain = Column(Text, nullable=True)           # JSON: {root_cause, trigger, cascade, intervention_window, if_ignored}
    kpi_json = Column(Text, nullable=True)               # JSON: {kpi_key: float} — industry KPIs computed from data
    benchmark_comparison_json = Column(Text, nullable=True)  # JSON: {kpi_key: {yours, industry_avg, count}} — Pro only
    # Grounding audit: were any claims softened for accuracy?
    cai_revised = Column(Boolean, default=False, server_default="false", nullable=True)
    cai_critique_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    report = relationship("Report", back_populates="insights")


class Subscription(Base):
    """Records every payment — plan_tier on User is the live source of truth."""
    __tablename__ = "ops_subscriptions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("ops_users.id"), nullable=False)
    plan_tier = Column(String(20), nullable=False)
    razorpay_order_id = Column(String(100))
    razorpay_payment_id = Column(String(100))
    gateway = Column(String(20))           # cashfree | stripe
    gateway_order_id = Column(String(100))
    gateway_payment_id = Column(String(100))
    amount_paise = Column(Integer, default=0)
    status = Column(String(20), default="pending")  # pending | active
    started_at = Column(DateTime)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    user = relationship("User", back_populates="subscriptions")


class ManualPayment(Base):
    """Direct bank transfer / UPI payments — approved manually by admin."""
    __tablename__ = "ops_manual_payments"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("ops_users.id"), nullable=False)
    plan_tier = Column(String(30), nullable=False)
    amount_inr = Column(Integer, nullable=False)
    utr_reference = Column(String(100), nullable=False)  # UTR / transaction ID from bank
    transfer_method = Column(String(20), default="upi")  # upi | neft | rtgs | imps
    notes = Column(Text, nullable=True)
    status = Column(String(20), default="pending")       # pending | approved | rejected
    rejection_reason = Column(Text, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    user = relationship("User")


class OpsBrief(Base):
    """Cross-vertical AGI synthesis — finds hidden causal chains across all verticals."""
    __tablename__ = "ops_briefs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("ops_users.id"), nullable=False)
    brief_json = Column(Text, nullable=False)
    vertical_count = Column(Integer, default=0)
    insight_ids_json = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    user = relationship("User")


class IndustryBenchmark(Base):
    """Data flywheel: aggregates anonymized risk scores per industry across all users."""
    __tablename__ = "ops_industry_benchmarks"
    id = Column(Integer, primary_key=True, autoincrement=True)
    industry = Column(String(50), unique=True, nullable=False)
    sum_risk_score = Column(BigInteger, default=0)
    sum_delay_probability = Column(BigInteger, default=0)
    sum_inventory_risk = Column(BigInteger, default=0)
    report_count = Column(Integer, default=0)
    kpi_sums_json = Column(Text, nullable=True)  # JSON: {kpi_key: {sum: float, count: int}}
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


# ── GSTGuard module ──────────────────────────────────────────────────────────

class GSTNotice(Base):
    """GST notice uploaded by a CA firm user."""
    __tablename__ = "gst_notices"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("ops_users.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    raw_text = Column(Text)
    notice_type = Column(String(30))          # ASMT-10|DRC-01|DRC-01A|DRC-07|GSTR-3A|ADT-01|GSTR_mismatch|DRC-10
    gstin = Column(String(20))
    taxpayer_name = Column(String(255))
    notice_number = Column(String(100))
    notice_date = Column(String(20))          # ISO date string
    deadline = Column(String(20))             # ISO date string — ONLY if explicitly in notice
    demand_amount_inr = Column(BigInteger)
    period = Column(String(100))
    issues_json = Column(Text)                # JSON list of issue strings
    issuing_authority = Column(String(255))
    extraction_confidence = Column(String(10), default="low")
    field_sources_json = Column(Text)         # JSON: {field: found|inferred|absent}
    ca_orientation_json = Column(Text)        # JSON: {plain_summary, key_documents, ca_notes}
    status = Column(String(20), default="draft")  # draft | reviewed | filed
    created_at = Column(DateTime, server_default=func.now())
    user = relationship("User")
    drafts = relationship("GSTDraft", back_populates="notice", cascade="all, delete")


class GSTDraft(Base):
    """AI-generated draft reply to a GST notice, with CAI critique loop applied."""
    __tablename__ = "gst_drafts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    notice_id = Column(UUID(as_uuid=True), ForeignKey("gst_notices.id"), nullable=False)
    draft_text = Column(Text, nullable=False)
    version = Column(Integer, default=1)
    cai_critique_notes = Column(Text)
    cai_revised = Column(Boolean, default=False)
    draft_figures_json = Column(Text)         # JSON: [{figure, type, status, note}]
    accepted = Column(Boolean, default=False)
    accepted_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    notice = relationship("GSTNotice", back_populates="drafts")


class GSTCorpus(Base):
    """Anonymized patterns flywheel — no PII, used to improve extraction quality."""
    __tablename__ = "gst_corpus"
    id = Column(Integer, primary_key=True, autoincrement=True)
    notice_type = Column(String(30))
    issue_count = Column(Integer, default=0)
    cai_passed = Column(Boolean, default=True)
    cai_revised = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
