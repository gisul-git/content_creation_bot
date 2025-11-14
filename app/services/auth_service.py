"""
Authentication service with business logic.
"""
from datetime import datetime, timedelta
from typing import Optional, Tuple
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.models.session import Session
from app.models.token import PasswordResetToken, EmailVerificationToken
from app.core.security import (
    hash_password, verify_password, create_access_token, create_refresh_token,
    generate_verification_token, generate_password_reset_token
)
from app.core.config import settings
from app.core.database import get_redis
from bson import ObjectId
import uuid
import secrets


class AuthService:
    """Authentication service."""
    
    @staticmethod
    async def register_user(
        email: str,
        password: str,
        first_name: str,
        last_name: str,
        phone: Optional[str] = None,
        ip_address: str = "unknown",
        user_agent: str = "unknown"
    ) -> User:
        """Register a new user."""
        # Check if user already exists
        existing_user = await User.find_one(User.email == email.lower())
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        password_hash = hash_password(password)
        
        # Generate verification token
        verification_token = generate_verification_token()
        # Hash token for storage
        import hashlib
        token_hash = hashlib.sha256(verification_token.encode()).hexdigest()
        
        # Create user
        user = User(
            email=email.lower(),
            password_hash=password_hash,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            is_email_verified=False,
            email_verification_token=token_hash,
            email_verification_expires=datetime.utcnow() + timedelta(
                hours=settings.EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS
            ),
            password_changed_at=datetime.utcnow(),
        )
        
        await user.insert()
        
        # Store verification token (for email link)
        verification_doc = EmailVerificationToken(
            user_id=user.id,
            token=token_hash,
            expires_at=user.email_verification_expires
        )
        await verification_doc.insert()
        
        # Send verification email
        from app.services.email_service import email_service
        await email_service.send_verification_email(
            email=user.email,
            token=verification_token,  # Send plain token in email
            first_name=user.first_name
        )
        
        return user
    
    @staticmethod
    async def login_user(
        email: str,
        password: str,
        remember_me: bool = False,
        ip_address: str = "unknown",
        user_agent: str = "unknown"
    ) -> Tuple[User, str, str, Session]:
        """Login user and create session."""
        # Find user
        user = await User.find_one(User.email == email.lower())
        if not user:
            # Don't reveal if email exists (security)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check if account is locked
        if user.is_locked():
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail=f"Account locked. Try again after {user.locked_until}"
            )
        
        # Check if account is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive"
            )
        
        # Check if account is suspended
        if user.is_suspended:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is suspended"
            )
        
        # Verify password
        if not user.password_hash or not verify_password(password, user.password_hash):
            # Increment failed attempts
            user.failed_login_attempts += 1
            
            # Lock account if max attempts reached
            if user.failed_login_attempts >= settings.MAX_LOGIN_ATTEMPTS:
                user.locked_until = datetime.utcnow() + timedelta(
                    minutes=settings.ACCOUNT_LOCKOUT_DURATION_MINUTES
                )
                await user.save()
                raise HTTPException(
                    status_code=status.HTTP_423_LOCKED,
                    detail=f"Account locked due to too many failed attempts. Try again in {settings.ACCOUNT_LOCKOUT_DURATION_MINUTES} minutes."
                )
            
            await user.save()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check email verification
        if not user.is_email_verified:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email not verified. Please check your email for verification link."
            )
        
        # Reset failed attempts
        user.failed_login_attempts = 0
        user.locked_until = None
        user.last_login = datetime.utcnow()
        user.last_login_ip = ip_address
        user.last_login_user_agent = user_agent
        await user.save()
        
        # Create tokens
        access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
        refresh_token = create_refresh_token(
            data={"sub": str(user.id), "role": user.role.value},
            remember_me=remember_me
        )
        
        # Create session
        session_id = str(uuid.uuid4())
        expires_delta = timedelta(days=settings.REFRESH_TOKEN_REMEMBER_DAYS if remember_me else settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
        session = Session(
            session_id=session_id,
            user_id=user.id,
            access_token_jti=secrets.token_urlsafe(32),  # Simplified for now
            refresh_token_jti=secrets.token_urlsafe(32),
            ip_address=ip_address,
            user_agent=user_agent,
            expires_at=datetime.utcnow() + expires_delta
        )
        await session.insert()
        
        # Store session in Redis
        redis = get_redis()
        session_key = f"session:{session_id}"
        await redis.setex(
            session_key,
            int(expires_delta.total_seconds()),
            str(user.id)
        )
        
        return user, access_token, refresh_token, session
    
    @staticmethod
    async def verify_email(token: str) -> User:
        """Verify user email with token."""
        # Hash the token to find it
        import hashlib
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        
        # Find verification token
        verification = await EmailVerificationToken.find_one(
            EmailVerificationToken.token == token_hash,
            EmailVerificationToken.used == False
        )
        
        if not verification:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification token"
            )
        
        # Check expiration
        if verification.expires_at < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification token has expired"
            )
        
        # Get user
        user = await User.get(verification.user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Verify email
        user.is_email_verified = True
        user.email_verification_token = None
        user.email_verification_expires = None
        await user.save()
        
        # Mark token as used
        verification.used = True
        verification.used_at = datetime.utcnow()
        await verification.save()
        
        # Send welcome email
        from app.services.email_service import email_service
        await email_service.send_welcome_email(
            email=user.email,
            first_name=user.first_name
        )
        
        return user
    
    @staticmethod
    async def logout_user(session_id: str) -> bool:
        """Logout user by invalidating session."""
        session = await Session.find_one(Session.session_id == session_id)
        if session:
            session.is_active = False
            session.logout_at = datetime.utcnow()
            await session.save()
        
        # Remove from Redis
        redis = get_redis()
        await redis.delete(f"session:{session_id}")
        
        return True

