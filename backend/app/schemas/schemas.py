from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    company_name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: UUID
    email: str
    company_name: str

    class Config:
        from_attributes = True


class ReportResponse(BaseModel):
    id: UUID
    file_name: str
    file_type: str | None
    rows_count: int
    industry: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class InsightResponse(BaseModel):
    id: UUID
    report_id: UUID
    risk_score: int
    delay_probability: int
    inventory_risk: int
    bottleneck_summary: str | None
    executive_summary: str | None
    recommendations: str | None
    industry_detected: str | None
    cost_impact_usd: int | None
    vertical_ai_score: int | None
    annual_savings_usd: int | None
    # Kai-Fu Lee: sub-vertical, feedback loop, expert trust, flywheel
    sub_vertical: str | None = None
    resolved_at: datetime | None = None
    resolution_note: str | None = None
    expert_reviewed: bool = False
    benchmark_count: int | None = None
    agi_analysis: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class ResolveRequest(BaseModel):
    note: str = ""


# Public endpoints — no user/auth fields exposed
class PublicDemoResponse(BaseModel):
    risk_score: int = 0
    delay_probability: int = 0
    inventory_risk: int = 0
    bottleneck_summary: str | None = None
    executive_summary: str | None = None
    recommendations: str | None = None
    industry_detected: str | None = None
    cost_impact_usd: int | None = None
    vertical_ai_score: int | None = None
    annual_savings_usd: int | None = None
    sub_vertical: str | None = None


class SharedInsightData(BaseModel):
    risk_score: int = 0
    delay_probability: int = 0
    inventory_risk: int = 0
    bottleneck_summary: str | None = None
    executive_summary: str | None = None
    recommendations: str | None = None
    industry_detected: str | None = None
    cost_impact_usd: int | None = None
    vertical_ai_score: int | None = None
    annual_savings_usd: int | None = None
    sub_vertical: str | None = None
    agi_analysis: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class SharedReportResponse(BaseModel):
    file_name: str
    industry: str | None = None
    rows_count: int = 0
    created_at: datetime
    insight: SharedInsightData


class BenchmarkResponse(BaseModel):
    industry: str
    avg_risk_score: float
    avg_delay_probability: float
    avg_inventory_risk: float
    report_count: int


class CreateOrderRequest(BaseModel):
    plan_tier: str
    gateway: str = "cashfree"  # cashfree | stripe


class CreateOrderResponse(BaseModel):
    order_id: str
    payment_url: str
    amount: int
    currency: str
    plan_tier: str
    plan_name: str


class VerifyPaymentRequest(BaseModel):
    order_id: str
    gateway: str = "cashfree"  # cashfree | stripe


class PlanResponse(BaseModel):
    plan_tier: str
    status: str
    expires_at: datetime | None = None
    features: list[str]
    is_trial: bool = False
    days_remaining: int | None = None
