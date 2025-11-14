"""
OAuth routes for Google and Microsoft.
Fixed: Microsoft OAuth callback redirect loop issue
"""
from fastapi import APIRouter, Request, HTTPException, status
from fastapi.responses import RedirectResponse, JSONResponse
from app.services.oauth_service import OAuthService
from app.core.config import settings
from typing import Optional

router = APIRouter(prefix="/api/v1/auth", tags=["oauth"])


@router.get("/google/login")
async def google_login():
    """Initiate Google OAuth login."""
    try:
        oauth_url = await OAuthService.get_google_oauth_url()
        return RedirectResponse(url=oauth_url)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate Google OAuth: {str(e)}"
        )


@router.get("/google/callback")
async def google_callback(code: Optional[str] = None, error: Optional[str] = None, request: Request = None):
    """Handle Google OAuth callback."""
    if error:
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/login?error=oauth_error&message={error}"
        )
    
    if not code:
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/login?error=no_code"
        )
    
    try:
        user, access_token, refresh_token, session = await OAuthService.handle_google_callback(code)
        
        # Redirect to frontend with tokens in query (or use cookies)
        # For security, we'll redirect to a frontend page that handles token storage
        redirect_url = f"{settings.FRONTEND_URL}/auth/callback?access_token={access_token}&refresh_token={refresh_token}"
        return RedirectResponse(url=redirect_url)
    except HTTPException:
        raise
    except Exception as e:
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/login?error=oauth_failed&message={str(e)}"
        )


@router.get("/microsoft/login")
async def microsoft_login():
    """
    Initiate Microsoft OAuth login.
    
    IMPORTANT: The redirect URI here must EXACTLY match what's configured in Azure AD.
    This should be: http://localhost:8000/api/auth/callback/azure-ad
    """
    try:
        # Use the redirect URI that matches Azure AD configuration
        # This is defined directly in main.py as a separate route: /api/auth/callback/azure-ad
        azure_ad_redirect_uri = f"{settings.BACKEND_URL}/api/auth/callback/azure-ad"
        oauth_url = await OAuthService.get_microsoft_oauth_url(redirect_uri=azure_ad_redirect_uri)
        return RedirectResponse(url=oauth_url, status_code=302)  # Explicit 302 redirect
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate Microsoft OAuth: {str(e)}"
        )


# This route is NOT used - the callback is handled in main.py at /api/auth/callback/azure-ad
# Keeping this for reference but it won't be called
@router.get("/microsoft/callback")
async def microsoft_callback_deprecated(code: Optional[str] = None, error: Optional[str] = None, request: Request = None):
    """
    DEPRECATED: This route is not used. 
    Microsoft callback is handled at /api/auth/callback/azure-ad in main.py
    """
    return RedirectResponse(
        url=f"{settings.FRONTEND_URL}/login?error=wrong_callback_route"
    )
