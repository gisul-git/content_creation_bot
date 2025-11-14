"""
Admin request/response schemas.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from app.models.user import UserRole


class AdminLoginRequest(BaseModel):
    """Admin login request."""
    email: EmailStr
    password: str


class UserUpdateRequest(BaseModel):
    """Update user request (admin)."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    is_suspended: Optional[bool] = None
    suspension_reason: Optional[str] = None


class UserListResponse(BaseModel):
    """User list response."""
    users: List[dict]
    total: int
    page: int
    page_size: int


class StatisticsResponse(BaseModel):
    """Dashboard statistics."""
    total_users: int
    active_users: int
    verified_users: int
    oauth_users: int
    recent_registrations: List[dict]

