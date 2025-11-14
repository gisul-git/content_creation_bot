"""
Token models for password reset and email verification.
"""
from beanie import Document, Indexed
from pydantic import Field, ConfigDict
from typing import Optional
from datetime import datetime
from bson import ObjectId


class PasswordResetToken(Document):
    """Password reset token document."""
    
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    user_id: ObjectId
    token: Indexed(str, unique=True)  # Hashed token
    ip_address: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    used: bool = False
    used_at: Optional[datetime] = None
    
    class Settings:
        name = "password_reset_tokens"
        indexes = [
            [("token", 1)],  # Unique index
            [("expires_at", 1)],  # TTL index
        ]


class EmailVerificationToken(Document):
    """Email verification token document."""
    
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    user_id: ObjectId
    token: Indexed(str, unique=True)  # Hashed token
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    used: bool = False
    used_at: Optional[datetime] = None
    
    class Settings:
        name = "email_verification_tokens"
        indexes = [
            [("token", 1)],  # Unique index
            [("expires_at", 1)],  # TTL index
        ]

