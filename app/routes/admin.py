"""
Admin routes.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from fastapi.responses import JSONResponse
from app.schemas.admin import AdminLoginRequest, UserUpdateRequest, UserListResponse, StatisticsResponse
from app.models.user import User, UserRole
from app.core.dependencies import get_current_admin_user, get_current_super_admin
from app.services.auth_service import AuthService
from app.core.security import create_access_token, create_refresh_token
from app.models.session import Session
from datetime import datetime, timedelta
from typing import Optional
import secrets
import uuid

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


@router.post("/login")
async def admin_login(request: AdminLoginRequest, http_request: Request):
    """Admin login (password-only, no OAuth)."""
    # Find admin user
    user = await User.find_one(
        User.email == request.email.lower(),
        User.role.in_([UserRole.ADMIN, UserRole.SUPER_ADMIN])
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Verify password
    from app.core.security import verify_password
    if not user.password_hash or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Check if account is active
    if not user.is_active or user.is_suspended:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive or suspended"
        )
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    refresh_token = create_refresh_token(data={"sub": str(user.id), "role": user.role.value})
    
    # Create session
    session_id = str(uuid.uuid4())
    session = Session(
        session_id=session_id,
        user_id=user.id,
        access_token_jti=secrets.token_urlsafe(32),
        refresh_token_jti=secrets.token_urlsafe(32),
        ip_address=http_request.client.host if http_request.client else "unknown",
        user_agent=http_request.headers.get("user-agent", "unknown"),
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    await session.insert()
    
    response = JSONResponse({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role.value
        }
    })
    
    response.set_cookie("access_token", access_token, httponly=True, samesite="lax", max_age=15 * 60)
    response.set_cookie("refresh_token", refresh_token, httponly=True, samesite="lax", max_age=7 * 24 * 60 * 60)
    
    return response


@router.get("/users", response_model=UserListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    role: Optional[UserRole] = None,
    is_active: Optional[bool] = None,
    is_verified: Optional[bool] = None,
    current_admin: User = Depends(get_current_admin_user)
):
    """List all users with pagination and filters."""
    # Build query
    query = {}
    if search:
        query["$or"] = [
            {"email": {"$regex": search, "$options": "i"}},
            {"first_name": {"$regex": search, "$options": "i"}},
            {"last_name": {"$regex": search, "$options": "i"}},
        ]
    if role:
        query["role"] = role
    if is_active is not None:
        query["is_active"] = is_active
    if is_verified is not None:
        query["is_email_verified"] = is_verified
    
    # Get total count
    total = await User.find(query).count()
    
    # Get paginated users
    skip = (page - 1) * page_size
    users = await User.find(query).skip(skip).limit(page_size).to_list()
    
    return {
        "users": [
            {
                "id": str(u.id),
                "email": u.email,
                "first_name": u.first_name,
                "last_name": u.last_name,
                "role": u.role.value,
                "is_active": u.is_active,
                "is_suspended": u.is_suspended,
                "is_email_verified": u.is_email_verified,
                "created_at": u.created_at.isoformat(),
                "last_login": u.last_login.isoformat() if u.last_login else None,
            }
            for u in users
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/users/{user_id}")
async def get_user(user_id: str, current_admin: User = Depends(get_current_admin_user)):
    """Get user details."""
    from bson import ObjectId
    
    try:
        user = await User.get(ObjectId(user_id))
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "id": str(user.id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone": user.phone,
            "role": user.role.value,
            "is_active": user.is_active,
            "is_suspended": user.is_suspended,
            "suspension_reason": user.suspension_reason,
            "is_email_verified": user.is_email_verified,
            "oauth_providers": [p.dict() for p in user.oauth_providers],
            "created_at": user.created_at.isoformat(),
            "last_login": user.last_login.isoformat() if user.last_login else None,
        }
    except Exception:
        raise HTTPException(status_code=404, detail="User not found")


@router.put("/users/{user_id}")
async def update_user(
    user_id: str,
    request: UserUpdateRequest,
    current_admin: User = Depends(get_current_admin_user)
):
    """Update user (admin)."""
    from bson import ObjectId
    
    try:
        user = await User.get(ObjectId(user_id))
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Only super admin can change roles
        if request.role and current_admin.role != UserRole.SUPER_ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only super admin can change user roles"
            )
        
        # Update fields
        if request.first_name is not None:
            user.first_name = request.first_name
        if request.last_name is not None:
            user.last_name = request.last_name
        if request.phone is not None:
            user.phone = request.phone
        if request.role is not None:
            user.role = request.role
        if request.is_active is not None:
            user.is_active = request.is_active
        if request.is_suspended is not None:
            user.is_suspended = request.is_suspended
        if request.suspension_reason is not None:
            user.suspension_reason = request.suspension_reason
        
        user.updated_at = datetime.utcnow()
        await user.save()
        
        return {"message": "User updated successfully", "user_id": str(user.id)}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=404, detail="User not found")


@router.post("/users/{user_id}/suspend")
async def suspend_user(
    user_id: str,
    reason: Optional[str] = None,
    current_admin: User = Depends(get_current_admin_user)
):
    """Suspend user account."""
    from bson import ObjectId
    
    user = await User.get(ObjectId(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_suspended = True
    user.suspension_reason = reason
    user.updated_at = datetime.utcnow()
    await user.save()
    
    return {"message": "User suspended successfully"}


@router.post("/users/{user_id}/activate")
async def activate_user(
    user_id: str,
    current_admin: User = Depends(get_current_admin_user)
):
    """Activate user account."""
    from bson import ObjectId
    
    user = await User.get(ObjectId(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_suspended = False
    user.suspension_reason = None
    user.is_active = True
    user.updated_at = datetime.utcnow()
    await user.save()
    
    return {"message": "User activated successfully"}


@router.get("/statistics", response_model=StatisticsResponse)
async def get_statistics(current_admin: User = Depends(get_current_admin_user)):
    """Get dashboard statistics."""
    total_users = await User.find().count()
    active_users = await User.find(User.is_active == True).count()
    verified_users = await User.find(User.is_email_verified == True).count()
    
    # Count OAuth users
    oauth_users = await User.find(
        User.oauth_providers != []
    ).count()
    
    # Recent registrations (last 7 days)
    recent_cutoff = datetime.utcnow() - timedelta(days=7)
    recent_users = await User.find(
        User.created_at >= recent_cutoff
    ).sort(-User.created_at).limit(10).to_list()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "verified_users": verified_users,
        "oauth_users": oauth_users,
        "recent_registrations": [
            {
                "id": str(u.id),
                "email": u.email,
                "name": u.get_full_name(),
                "created_at": u.created_at.isoformat(),
            }
            for u in recent_users
        ],
    }


@router.post("/users/{user_id}/verify-email")
async def verify_user_email(
    user_id: str,
    current_admin: User = Depends(get_current_admin_user)
):
    """Manually verify user email (admin)."""
    from bson import ObjectId
    
    user = await User.get(ObjectId(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_email_verified = True
    user.email_verification_token = None
    user.email_verification_expires = None
    await user.save()
    
    return {"message": "User email verified successfully"}


@router.post("/users/{user_id}/send-verification")
async def send_verification_email(
    user_id: str,
    current_admin: User = Depends(get_current_admin_user)
):
    """Manually send verification email (admin)."""
    from bson import ObjectId
    from app.core.security import generate_verification_token
    from app.services.email_service import email_service
    import hashlib
    
    user = await User.get(ObjectId(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.is_email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User email is already verified"
        )
    
    # Generate new token
    verification_token = generate_verification_token()
    token_hash = hashlib.sha256(verification_token.encode()).hexdigest()
    
    user.email_verification_token = token_hash
    user.email_verification_expires = datetime.utcnow() + timedelta(hours=24)
    await user.save()
    
    # Send email
    await email_service.send_verification_email(
        email=user.email,
        token=verification_token,
        first_name=user.first_name
    )
    
    return {"message": "Verification email sent successfully"}

