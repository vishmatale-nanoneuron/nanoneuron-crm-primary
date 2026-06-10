import uuid
from sqlalchemy import Column, String, Text, Integer, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    company_name = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    reports = relationship("Report", back_populates="user", cascade="all, delete")

class Report(Base):
    __tablename__ = "reports"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50))
    extracted_text = Column(Text)
    rows_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    user = relationship("User", back_populates="reports")
    insights = relationship("Insight", back_populates="report", cascade="all, delete")

class Insight(Base):
    __tablename__ = "insights"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_id = Column(UUID(as_uuid=True), ForeignKey("reports.id"), nullable=False)
    risk_score = Column(Integer, default=0)
    delay_probability = Column(Integer, default=0)
    inventory_risk = Column(Integer, default=0)
    bottleneck_summary = Column(Text)
    executive_summary = Column(Text)
    recommendations = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    report = relationship("Report", back_populates="insights")
