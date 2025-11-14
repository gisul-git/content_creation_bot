"""
User management routes (for authenticated users).
"""
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import User
from app.core.dependencies import get_current_user
from pydantic import BaseModel, EmailStr
from typing import Optional

router = APIRouter(prefix="/api/v1/users", tags=["users"])


class UserUpdateRequest(BaseModel):
    """Update user profile request."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None


@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "phone": current_user.phone,
        "bio": current_user.bio,
        "profile_picture": current_user.profile_picture,
        "role": current_user.role.value,
        "is_email_verified": current_user.is_email_verified,
        "created_at": current_user.created_at.isoformat(),
        "last_login": current_user.last_login.isoformat() if current_user.last_login else None,
        "oauth_providers": [
            {
                "provider": p.provider.value,
                "linked_at": p.linked_at.isoformat(),
            }
            for p in current_user.oauth_providers
        ],
    }


@router.put("/me")
async def update_profile(
    request: UserUpdateRequest,
    current_user: User = Depends(get_current_user)
):
    """Update user profile."""
    if request.first_name is not None:
        current_user.first_name = request.first_name
    if request.last_name is not None:
        current_user.last_name = request.last_name
    if request.phone is not None:
        current_user.phone = request.phone
    if request.bio is not None:
        current_user.bio = request.bio
    
    from datetime import datetime
    current_user.updated_at = datetime.utcnow()
    await current_user.save()
    
    return {"message": "Profile updated successfully"}


@router.get("/me/sessions")
async def get_user_sessions(current_user: User = Depends(get_current_user)):
    """Get user's active sessions."""
    from app.models.session import Session
    from datetime import datetime
    
    sessions = await Session.find(
        Session.user_id == current_user.id,
        Session.is_active == True,
        Session.expires_at > datetime.utcnow()
    ).to_list()
    
    return {
        "sessions": [
            {
                "session_id": s.session_id,
                "ip_address": s.ip_address,
                "user_agent": s.user_agent,
                "device_type": s.device_type,
                "browser": s.browser,
                "os": s.os,
                "location": s.location,
                "created_at": s.created_at.isoformat(),
                "last_activity": s.last_activity.isoformat(),
                "expires_at": s.expires_at.isoformat(),
            }
            for s in sessions
        ]
    }


@router.delete("/me/sessions/{session_id}")
async def terminate_session(
    session_id: str,
    current_user: User = Depends(get_current_user)
):
    """Terminate a specific session."""
    from app.models.session import Session
    from datetime import datetime
    from app.core.database import get_redis
    
    session = await Session.find_one(
        Session.session_id == session_id,
        Session.user_id == current_user.id
    )
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    session.is_active = False
    session.logout_at = datetime.utcnow()
    await session.save()
    
    # Remove from Redis
    redis = get_redis()
    await redis.delete(f"session:{session_id}")
    
    return {"message": "Session terminated successfully"}

