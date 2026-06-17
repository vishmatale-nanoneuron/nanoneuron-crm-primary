from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str = "change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    OPENAI_API_KEY: str = ""  # unused — kept for backward compat with existing env vars
    ENVIRONMENT: str = "production"
    ADMIN_SECRET: str = ""
    ADMIN_EMAIL: str = "vish.matale@gmail.com"
    RESEND_API_KEY: str = ""
    DIGEST_FROM_EMAIL: str = "service@nanoneuron.ai"
    APP_URL: str = "https://nanoneuron.ai"
    # Direct bank transfer details (set these in Cloud Run env vars)
    UPI_ID: str = ""
    BANK_ACCOUNT_NAME: str = ""
    BANK_ACCOUNT_NUMBER: str = ""
    BANK_IFSC: str = ""
    BANK_NAME: str = ""
    # Razorpay gateway (set RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET in Cloud Run env vars)
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    ANTHROPIC_API_KEY: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
