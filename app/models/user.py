"""
User model using Beanie ODM.
"""
from beanie import Document, Indexed
from pydantic import EmailStr, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    """User roles."""
    USER = "user"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"


class OAuthProvider(str, Enum):
    """OAuth providers."""
    GOOGLE = "google"
    MICROSOFT = "microsoft"


from pydantic import BaseModel


class OAuthProviderInfo(BaseModel):
    """OAuth provider information."""
    provider: OAuthProvider
    provider_user_id: str
    linked_at: datetime = Field(default_factory=datetime.utcnow)
    email: Optional[str] = None


class EmailPreferences(BaseModel):
    """Email preferences."""
    marketing: bool = False
    security_alerts: bool = True
    product_updates: bool = True


class User(Document):
    """User document model."""
    
    # Basic Info
    email: Indexed(EmailStr, unique=True)
    password_hash: Optional[str] = None  # None for OAuth-only users
    first_name: str
    last_name: str
    phone: Optional[str] = None
    profile_picture: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=500)
    
    # Verification
    is_email_verified: bool = False
    email_verification_token: Optional[str] = None
    email_verification_expires: Optional[datetime] = None
    
    # Account Status
    is_active: bool = True
    is_suspended: bool = False
    suspension_reason: Optional[str] = None
    
    # Roles & Permissions
    role: UserRole = UserRole.USER
    permissions: List[str] = Field(default_factory=list)
    
    # OAuth Integration
    oauth_providers: List[OAuthProviderInfo] = Field(default_factory=list)
    
    # Security
    password_changed_at: Optional[datetime] = None
    password_history: List[str] = Field(default_factory=list)  # Last 5 hashed passwords
    failed_login_attempts: int = 0
    locked_until: Optional[datetime] = None
    last_login: Optional[datetime] = None
    last_login_ip: Optional[str] = None
    last_login_user_agent: Optional[str] = None
    
    # Preferences
    email_preferences: EmailPreferences = Field(default_factory=EmailPreferences)
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = None
    
    class Settings:
        name = "users"
        indexes = [
            [("email", 1)],  # Unique index
            [("oauth_providers.provider_user_id", 1)],
            [("created_at", -1)],
            [("role", 1)],
        ]
    
    def is_locked(self) -> bool:
        """Check if account is locked."""
        if self.locked_until is None:
            return False
        return datetime.utcnow() < self.locked_until
    
    def has_oauth_provider(self, provider: OAuthProvider) -> bool:
        """Check if user has linked OAuth provider."""
        return any(p.provider == provider for p in self.oauth_providers)
    
    def get_full_name(self) -> str:
        """Get user's full name."""
        return f"{self.first_name} {self.last_name}".strip()

