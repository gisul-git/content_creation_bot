"""
Audit log model for tracking user and admin actions.
"""
from beanie import Document
from pydantic import Field, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
from enum import Enum


class AuditAction(str, Enum):
    """Audit action types."""
    LOGIN = "login"
    LOGOUT = "logout"
    REGISTER = "register"
    PASSWORD_CHANGE = "password_change"
    PROFILE_UPDATE = "profile_update"
    ADMIN_ACTION = "admin_action"
    EMAIL_VERIFIED = "email_verified"
    PASSWORD_RESET_REQUESTED = "password_reset_requested"
    PASSWORD_RESET_COMPLETED = "password_reset_completed"
    ACCOUNT_SUSPENDED = "account_suspended"
    ACCOUNT_ACTIVATED = "account_activated"
    OAUTH_LINKED = "oauth_linked"
    OAUTH_UNLINKED = "oauth_unlinked"


class AuditLog(Document):
    """Audit log document model."""
    
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    user_id: Optional[ObjectId] = None  # Null for anonymous actions
    action: AuditAction
    description: str
    
    # Context
    ip_address: str
    user_agent: str
    resource_type: Optional[str] = None  # user, session, etc.
    resource_id: Optional[str] = None
    
    # Admin Actions
    admin_id: Optional[ObjectId] = None  # Admin who performed action
    
    # Result
    success: bool = True
    error_message: Optional[str] = None
    
    # Metadata
    metadata: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "audit_logs"
        indexes = [
            [("user_id", 1), ("timestamp", -1)],
            [("admin_id", 1), ("timestamp", -1)],
            [("action", 1)],
            [("timestamp", -1)],
        ]

