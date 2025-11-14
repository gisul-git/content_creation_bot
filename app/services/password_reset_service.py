"""
Password reset service.
"""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, status
from app.models.user import User
from app.models.token import PasswordResetToken
from app.core.security import hash_password, verify_password, generate_password_reset_token
from app.core.config import settings
from app.services.email_service import email_service
import hashlib


class PasswordResetService:
    """Password reset service."""
    
    @staticmethod
    def _hash_token(token: str) -> str:
        """Hash a token for storage."""
        return hashlib.sha256(token.encode()).hexdigest()
    
    @staticmethod
    async def request_password_reset(email: str, ip_address: str = "unknown") -> bool:
        """Request password reset - send email with reset token."""
        # Find user
        user = await User.find_one(User.email == email.lower())
        if not user:
            # Don't reveal if email exists (security)
            return True  # Return success even if email doesn't exist
        
        # Check rate limiting (max 3 per hour)
        recent_resets = await PasswordResetToken.find(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.created_at >= datetime.utcnow() - timedelta(hours=1)
        ).to_list()
        
        if len(recent_resets) >= 3:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many password reset requests. Please try again later."
            )
        
        # Generate reset token
        reset_token = generate_password_reset_token()
        token_hash = PasswordResetService._hash_token(reset_token)
        
        # Create reset token document
        reset_doc = PasswordResetToken(
            user_id=user.id,
            token=token_hash,
            ip_address=ip_address,
            expires_at=datetime.utcnow() + timedelta(hours=settings.PASSWORD_RESET_TOKEN_EXPIRE_HOURS)
        )
        await reset_doc.insert()
        
        # Send email
        await email_service.send_password_reset_email(
            email=user.email,
            token=reset_token,  # Send plain token in email
            first_name=user.first_name
        )
        
        return True
    
    @staticmethod
    async def reset_password(token: str, new_password: str) -> User:
        """Reset password with token."""
        # Hash the token to find it
        token_hash = PasswordResetService._hash_token(token)
        
        # Find reset token
        reset_doc = await PasswordResetToken.find_one(
            PasswordResetToken.token == token_hash,
            PasswordResetToken.used == False
        )
        
        if not reset_doc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired password reset token"
            )
        
        # Check expiration
        if reset_doc.expires_at < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password reset token has expired"
            )
        
        # Get user
        user = await User.get(reset_doc.user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check password history (prevent reusing last 5 passwords)
        new_password_hash = hash_password(new_password)
        if new_password_hash in user.password_history:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot reuse a recent password"
            )
        
        # Update password
        # Add to password history (keep last 5)
        user.password_history.append(new_password_hash)
        if len(user.password_history) > 5:
            user.password_history = user.password_history[-5:]
        
        user.password_hash = new_password_hash
        user.password_changed_at = datetime.utcnow()
        user.failed_login_attempts = 0  # Reset failed attempts
        user.locked_until = None
        await user.save()
        
        # Mark token as used
        reset_doc.used = True
        reset_doc.used_at = datetime.utcnow()
        await reset_doc.save()
        
        return user

