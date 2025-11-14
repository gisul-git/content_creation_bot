"""
Application configuration from environment variables.
"""
try:
    from pydantic_settings import BaseSettings
except ImportError:
    # Fallback for older pydantic versions
    from pydantic import BaseSettings

from typing import Optional
import os
from pathlib import Path

# Load .env file from project root
env_path = Path(__file__).parent.parent.parent / '.env'


class Settings(BaseSettings):
    """Application settings."""
    
    # App
    APP_NAME: str = "Content Creation Bot"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "content_creation_bot"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    REDIS_SESSION_DB: int = 0
    REDIS_CACHE_DB: int = 1
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production-min-32-chars")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    REFRESH_TOKEN_REMEMBER_DAYS: int = 30
    
    # AWS SES
    AWS_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    SES_SENDER_EMAIL: str = "noreply@yourdomain.com"
    SES_SENDER_NAME: str = "Content Creation Bot"
    
    # OAuth - Google
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/google/callback"
    
    # OAuth - Microsoft
    MICROSOFT_CLIENT_ID: Optional[str] = None
    MICROSOFT_CLIENT_SECRET: Optional[str] = None
    MICROSOFT_TENANT_ID: str = "common"
    MICROSOFT_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/microsoft/callback"
    
    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Security
    BCRYPT_ROUNDS: int = 12
    PASSWORD_RESET_TOKEN_EXPIRE_HOURS: int = 1
    EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS: int = 24
    MAX_LOGIN_ATTEMPTS: int = 5
    ACCOUNT_LOCKOUT_DURATION_MINUTES: int = 15
    MAX_ACTIVE_SESSIONS: int = 5
    
    # Rate Limiting
    RATE_LIMIT_LOGIN: str = "5/15minute"
    RATE_LIMIT_REGISTER: str = "3/hour"
    RATE_LIMIT_FORGOT_PASSWORD: str = "3/hour"
    RATE_LIMIT_RESEND_VERIFICATION: str = "3/hour"
    
    # OpenAI (for existing chatbot features)
    OPENAI_API_KEY: Optional[str] = None
    
    # Backend URL (for internal use)
    BACKEND_URL: str = "http://localhost:8000"
    
    # Frontend environment variables (for Next.js)
    NEXT_PUBLIC_API_URL: Optional[str] = None
    
    class Config:
        env_file = env_path
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields in .env that aren't in Settings


settings = Settings()

