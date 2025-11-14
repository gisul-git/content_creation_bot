"""
Authentication routes.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
# Rate limiting is handled at the application level
from app.schemas.auth import (
    RegisterRequest, LoginRequest, LoginResponse, VerifyEmailRequest,
    ResendVerificationRequest, ForgotPasswordRequest, ResetPasswordRequest,
    ChangePasswordRequest, RefreshTokenRequest
)
from app.services.auth_service import AuthService
from app.models.user import User
from app.core.dependencies import get_current_user
from typing import Optional
from fastapi import Request

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, http_request: Request):
    """Register a new user."""
    try:
        user = await AuthService.register_user(
            email=request.email,
            password=request.password,
            first_name=request.first_name,
            last_name=request.last_name,
            phone=request.phone,
            ip_address=http_request.client.host if http_request.client else "unknown",
            user_agent=http_request.headers.get("user-agent", "unknown")
        )
        
        return {
            "message": "Registration successful. Please check your email to verify your account.",
            "user_id": str(user.id),
            "email": user.email
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, http_request: Request):
    """Login user."""
    try:
        user, access_token, refresh_token, session = await AuthService.login_user(
            email=request.email,
            password=request.password,
            remember_me=request.remember_me,
            ip_address=http_request.client.host if http_request.client else "unknown",
            user_agent=http_request.headers.get("user-agent", "unknown")
        )
        
        # Create response with cookies
        response = JSONResponse({
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role.value,
                "is_email_verified": user.is_email_verified
            },
            "expires_in": 15 * 60  # 15 minutes in seconds
        })
        
        # Set httpOnly cookies
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="lax",
            max_age=15 * 60  # 15 minutes
        )
        
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="lax",
            max_age=(30 if request.remember_me else 7) * 24 * 60 * 60  # days to seconds
        )
        
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )


@router.post("/logout")
async def logout(
    session_id: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Logout current session."""
    # TODO: Get session_id from request/cookie
    if session_id:
        await AuthService.logout_user(session_id)
    
    response = JSONResponse({"message": "Logged out successfully"})
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return response


@router.post("/verify-email")
async def verify_email(request: VerifyEmailRequest):
    """Verify user email with token."""
    try:
        user = await AuthService.verify_email(request.token)
        return {
            "message": "Email verified successfully",
            "user_id": str(user.id)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Email verification failed: {str(e)}"
        )


@router.post("/resend-verification")
async def resend_verification(request: ResendVerificationRequest, http_request: Request):
    """Resend verification email."""
    from app.models.token import EmailVerificationToken
    from datetime import datetime, timedelta
    from app.core.security import generate_verification_token
    from app.services.email_service import email_service
    import hashlib
    
    # Find user
    user = await User.find_one(User.email == request.email.lower())
    if not user:
        # Don't reveal if email exists
        return {"message": "If email exists, verification email has been sent"}
    
    if user.is_email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already verified"
        )
    
    # Check rate limiting (max 3 per hour)
    recent_requests = await EmailVerificationToken.find(
        EmailVerificationToken.user_id == user.id,
        EmailVerificationToken.created_at >= datetime.utcnow() - timedelta(hours=1)
    ).to_list()
    
    if len(recent_requests) >= 3:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many verification email requests. Please try again later."
        )
    
    # Generate new token
    verification_token = generate_verification_token()
    token_hash = hashlib.sha256(verification_token.encode()).hexdigest()
    
    # Update user
    user.email_verification_token = token_hash
    user.email_verification_expires = datetime.utcnow() + timedelta(
        hours=24  # 24 hours
    )
    await user.save()
    
    # Create new verification token document
    verification_doc = EmailVerificationToken(
        user_id=user.id,
        token=token_hash,
        expires_at=user.email_verification_expires
    )
    await verification_doc.insert()
    
    # Send email
    await email_service.send_verification_email(
        email=user.email,
        token=verification_token,
        first_name=user.first_name
    )
    
    return {"message": "Verification email sent"}


@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, http_request: Request):
    """Request password reset."""
    from app.services.password_reset_service import PasswordResetService
    
    try:
        await PasswordResetService.request_password_reset(
            email=request.email,
            ip_address=http_request.client.host if http_request.client else "unknown"
        )
        return {"message": "If email exists, password reset link has been sent"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password reset request failed: {str(e)}"
        )


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Reset password with token."""
    from app.services.password_reset_service import PasswordResetService
    
    try:
        user = await PasswordResetService.reset_password(
            token=request.token,
            new_password=request.new_password
        )
        return {
            "message": "Password reset successfully",
            "user_id": str(user.id)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password reset failed: {str(e)}"
        )


@router.post("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user)
):
    """Change password (requires current password)."""
    from app.core.security import verify_password, hash_password
    from datetime import datetime
    
    # OAuth users don't have passwords
    if not current_user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OAuth users cannot change password. Use OAuth to login."
        )
    
    # Verify current password
    if not verify_password(request.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    # Check password history
    new_password_hash = hash_password(request.new_password)
    if new_password_hash in current_user.password_history:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot reuse a recent password"
        )
    
    # Update password
    current_user.password_history.append(new_password_hash)
    if len(current_user.password_history) > 5:
        current_user.password_history = current_user.password_history[-5:]
    
    current_user.password_hash = new_password_hash
    current_user.password_changed_at = datetime.utcnow()
    await current_user.save()
    
    return {"message": "Password changed successfully"}


@router.post("/refresh")
async def refresh_token(request: RefreshTokenRequest):
    """Refresh access token."""
    from app.core.security import decode_token, create_access_token
    from app.models.user import User
    
    # Decode refresh token
    payload = decode_token(request.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("sub")
    user = await User.get(user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create new access token
    new_access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value}
    )
    
    response = JSONResponse({
        "access_token": new_access_token,
        "token_type": "bearer",
        "expires_in": 15 * 60
    })
    
    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=15 * 60
    )
    
    return response

