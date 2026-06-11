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
    last_digest_sent_at = Column(DateTime, nullable=True)
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


class IndustryBenchmark(Base):
    """Data flywheel: aggregates anonymized risk scores per industry across all users."""
    __tablename__ = "ops_industry_benchmarks"
    id = Column(Integer, primary_key=True, autoincrement=True)
    industry = Column(String(50), unique=True, nullable=False)
    sum_risk_score = Column(BigInteger, default=0)
    sum_delay_probability = Column(BigInteger, default=0)
    sum_inventory_risk = Column(BigInteger, default=0)
    report_count = Column(Integer, default=0)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
