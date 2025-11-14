"""
Rate limiting middleware using slowapi.
"""
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from app.core.config import settings

# Create limiter instance
limiter = Limiter(key_func=get_remote_address)

# Rate limit configurations
RATE_LIMITS = {
    "login": "5/15minute",
    "register": "3/hour",
    "forgot_password": "3/hour",
    "resend_verification": "3/hour",
    "default": "100/hour"
}


def get_rate_limit(endpoint_name: str) -> str:
    """Get rate limit for endpoint."""
    return RATE_LIMITS.get(endpoint_name, RATE_LIMITS["default"])

