from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str = "change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    OPENAI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    ENVIRONMENT: str = "production"
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    CASHFREE_APP_ID: str = ""
    CASHFREE_SECRET_KEY: str = ""
    CASHFREE_ENV: str = "production"
    INSTAMOJO_CLIENT_ID: str = ""
    INSTAMOJO_CLIENT_SECRET: str = ""
    INSTAMOJO_ENV: str = "production"
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    ADMIN_SECRET: str = ""
    RESEND_API_KEY: str = ""
    DIGEST_FROM_EMAIL: str = "service@nanoneuron.ai"
    APP_URL: str = "https://nanoneuron.ai"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
