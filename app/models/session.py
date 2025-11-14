"""
Session model for tracking user sessions.
"""
from beanie import Document, Indexed
from pydantic import Field, ConfigDict
from typing import Optional
from datetime import datetime
from bson import ObjectId


class Session(Document):
    """Session document model."""
    
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    session_id: Indexed(str, unique=True)  # UUID
    user_id: ObjectId
    access_token_jti: str  # JWT ID for access token
    refresh_token_jti: str  # JWT ID for refresh token
    
    # Session Info
    ip_address: str
    user_agent: str
    device_type: Optional[str] = None  # mobile, desktop, tablet
    browser: Optional[str] = None
    os: Optional[str] = None
    location: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_activity: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    
    # Security
    is_active: bool = True
    logout_at: Optional[datetime] = None
    
    class Settings:
        name = "sessions"
        indexes = [
            [("session_id", 1)],  # Unique index
            [("user_id", 1)],
            [("expires_at", 1)],  # TTL index
        ]

