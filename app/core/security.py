"""
Security utilities: password hashing, JWT tokens, OAuth helpers.
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from app.core.config import settings
import secrets

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=settings.BCRYPT_ROUNDS)


def hash_password(password: str) -> str:
    """Hash a password using bcrypt.
    
    Raises HTTPException if password exceeds bcrypt's 72-byte limit.
    This should be caught at the API level via Pydantic validation, but this
    provides an additional safety check.
    """
    # Bcrypt has a strict 72-byte limit - validate here as a safety check
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is too long. Maximum allowed is 72 bytes when encoded as UTF-8."
        )
    
    # Additional safety: truncate if somehow we got here (shouldn't happen with validation)
    # But we raise instead to catch any bugs
    try:
        return pwd_context.hash(password)
    except ValueError as e:
        if "cannot be longer than 72 bytes" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password is too long. Maximum allowed is 72 bytes when encoded as UTF-8."
            ) from e
        raise


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash.
    
    Note: bcrypt has a 72-byte limit. If password exceeds this, verification will fail.
    This should not happen in normal operation as passwords are validated at registration.
    """
    # Bcrypt has a 72-byte limit - truncate for verification if needed
    # (This handles edge cases where old passwords might have been truncated)
    password_bytes = plain_password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
        plain_password = password_bytes.decode('utf-8', errors='ignore')
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    })
    
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: Dict[str, Any], remember_me: bool = False) -> str:
    """Create a JWT refresh token."""
    to_encode = data.copy()
    
    if remember_me:
        expire_days = settings.REFRESH_TOKEN_REMEMBER_DAYS
    else:
        expire_days = settings.REFRESH_TOKEN_EXPIRE_DAYS
    
    expire = datetime.utcnow() + timedelta(days=expire_days)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "refresh"
    })
    
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and verify a JWT token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


def generate_secure_token(length: int = 32) -> str:
    """Generate a cryptographically secure random token."""
    return secrets.token_urlsafe(length)


def generate_verification_token() -> str:
    """Generate a secure email verification token."""
    return generate_secure_token(32)


def generate_password_reset_token() -> str:
    """Generate a secure password reset token."""
    return generate_secure_token(32)

