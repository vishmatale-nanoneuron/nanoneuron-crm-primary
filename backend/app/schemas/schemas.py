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
    created_at: datetime

    class Config:
        from_attributes = True


class BenchmarkResponse(BaseModel):
    industry: str
    avg_risk_score: float
    avg_delay_probability: float
    avg_inventory_risk: float
    report_count: int


class CreateOrderRequest(BaseModel):
    plan_tier: str


class CreateOrderResponse(BaseModel):
    order_id: str
    amount: int
    currency: str
    key_id: str
    plan_tier: str
    plan_name: str


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PlanResponse(BaseModel):
    plan_tier: str
    status: str
    expires_at: datetime | None = None
    features: list[str]
