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
    created_at: datetime
    class Config:
        from_attributes = True
