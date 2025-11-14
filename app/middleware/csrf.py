"""
CSRF protection middleware.
"""
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from typing import Callable
import secrets
import hmac
import hashlib


class CSRFProtection:
    """CSRF protection middleware."""
    
    def __init__(self):
        self.exempt_methods = {'GET', 'HEAD', 'OPTIONS'}
        self.exempt_paths = ['/api/v1/auth/google/callback', '/api/v1/auth/microsoft/callback']
    
    def generate_token(self) -> str:
        """Generate CSRF token."""
        return secrets.token_urlsafe(32)
    
    def verify_token(self, token: str, secret: str) -> bool:
        """Verify CSRF token."""
        try:
            expected = hmac.new(
                secret.encode(),
                token.encode(),
                hashlib.sha256
            ).hexdigest()
            return hmac.compare_digest(expected, token)
        except Exception:
            return False
    
    async def __call__(self, request: Request, call_next: Callable):
        """CSRF protection middleware."""
        # Skip CSRF for exempt methods
        if request.method in self.exempt_methods:
            return await call_next(request)
        
        # Skip CSRF for exempt paths
        if any(request.url.path.startswith(path) for path in self.exempt_paths):
            return await call_next(request)
        
        # For state-changing operations, check CSRF token
        # In production, implement proper CSRF token validation
        # For now, we rely on SameSite cookies and CORS
        
        return await call_next(request)


# CSRF protection instance
csrf_protection = CSRFProtection()

