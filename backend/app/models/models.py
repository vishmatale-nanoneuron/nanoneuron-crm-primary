import uuid
from sqlalchemy import Column, String, Text, Integer, Float, BigInteger, ForeignKey, DateTime
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
    created_at = Column(DateTime, server_default=func.now())
    reports = relationship("Report", back_populates="user", cascade="all, delete")


class Report(Base):
    __tablename__ = "ops_reports"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("ops_users.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50))
    extracted_text = Column(Text)
    rows_count = Column(Integer, default=0)
    industry = Column(String(50))
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
    created_at = Column(DateTime, server_default=func.now())
    report = relationship("Report", back_populates="insights")


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
