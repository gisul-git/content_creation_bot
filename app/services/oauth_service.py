"""
OAuth service for handling Google and Microsoft authentication.
Fixed: Proper redirect URI handling to prevent code reuse errors
"""
from typing import Tuple, Optional
import httpx
from fastapi import HTTPException, status
from datetime import datetime, timedelta
import logging
import secrets
import uuid

from app.models.user import User, OAuthProvider, OAuthProviderInfo, UserRole
from app.models.session import Session
from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token

logger = logging.getLogger(__name__)


class OAuthService:
    """Service for OAuth authentication."""
    
    @staticmethod
    async def get_google_oauth_url() -> str:
        """Generate Google OAuth authorization URL."""
        if not settings.GOOGLE_CLIENT_ID:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Google OAuth is not configured"
            )
        
        redirect_uri = settings.GOOGLE_REDIRECT_URI or f"{settings.BACKEND_URL}/api/v1/auth/google/callback"
        
        base_url = "https://accounts.google.com/o/oauth2/v2/auth"
        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "consent"
        }
        
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"{base_url}?{query_string}"
    
    @staticmethod
    async def get_microsoft_oauth_url(redirect_uri: Optional[str] = None) -> str:
        """
        Generate Microsoft OAuth authorization URL.
        
        Args:
            redirect_uri: Optional custom redirect URI. If not provided, uses settings.MICROSOFT_REDIRECT_URI
        """
        if not settings.MICROSOFT_CLIENT_ID:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Microsoft OAuth is not configured"
            )
        
        # Use provided redirect_uri or fall back to settings
        final_redirect_uri = redirect_uri or settings.MICROSOFT_REDIRECT_URI or f"{settings.BACKEND_URL}/api/auth/callback/azure-ad"
        
        tenant_id = settings.MICROSOFT_TENANT_ID or "common"
        base_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/authorize"
        
        params = {
            "client_id": settings.MICROSOFT_CLIENT_ID,
            "redirect_uri": final_redirect_uri,
            "response_type": "code",
            "scope": "openid email profile User.Read",
            "response_mode": "query"
        }
        
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        oauth_url = f"{base_url}?{query_string}"
        
        logger.info(f"Generated Microsoft OAuth URL with redirect_uri: {final_redirect_uri}")
        return oauth_url
    
    @staticmethod
    async def handle_google_callback(code: str) -> Tuple[User, str, str, Session]:
        """
        Handle Google OAuth callback.
        
        Args:
            code: Authorization code from Google
            
        Returns:
            Tuple of (user, access_token, refresh_token, session)
        """
        try:
            # Exchange code for tokens
            token_url = "https://oauth2.googleapis.com/token"
            redirect_uri = settings.GOOGLE_REDIRECT_URI or f"{settings.BACKEND_URL}/api/v1/auth/google/callback"
            
            data = {
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(token_url, data=data)
                
                if response.status_code != 200:
                    logger.error(f"Google token exchange failed: {response.json()}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Failed to exchange Google authorization code"
                    )
                
                tokens = response.json()
                access_token = tokens.get("access_token")
                
                # Get user info from Google
                user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
                headers = {"Authorization": f"Bearer {access_token}"}
                user_response = await client.get(user_info_url, headers=headers)
                
                if user_response.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Failed to get user info from Google"
                    )
                
                user_info = user_response.json()
            
            # Create or update user
            return await OAuthService._create_or_update_oauth_user(
                email=user_info.get("email"),
                provider=OAuthProvider.GOOGLE,
                provider_user_id=user_info.get("id"),
                first_name=user_info.get("given_name", ""),
                last_name=user_info.get("family_name", ""),
                profile_picture=user_info.get("picture")
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error handling Google callback: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"OAuth authentication failed: {str(e)}"
            )
    
    @staticmethod
    async def handle_microsoft_callback(code: str, redirect_uri: Optional[str] = None) -> Tuple[User, str, str, Session]:
        """
        Handle Microsoft OAuth callback.
        
        Args:
            code: Authorization code from Microsoft
            redirect_uri: The EXACT same redirect URI that was used in the authorization request
            
        Returns:
            Tuple of (user, access_token, refresh_token, session)
        """
        try:
            # CRITICAL: Use the same redirect_uri that was sent in the authorization request
            final_redirect_uri = redirect_uri or settings.MICROSOFT_REDIRECT_URI or f"{settings.BACKEND_URL}/api/auth/callback/azure-ad"
            
            logger.info(f"Exchanging Microsoft code with redirect_uri: {final_redirect_uri}")
            
            tenant_id = settings.MICROSOFT_TENANT_ID or "common"
            token_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
            
            data = {
                "code": code,
                "client_id": settings.MICROSOFT_CLIENT_ID,
                "client_secret": settings.MICROSOFT_CLIENT_SECRET,
                "redirect_uri": final_redirect_uri,  # MUST match authorization request
                "grant_type": "authorization_code",
                "scope": "openid email profile User.Read"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(token_url, data=data)
                
                if response.status_code != 200:
                    error_data = response.json()
                    logger.error(f"Microsoft token exchange failed: {error_data}")
                    logger.error(f"Token exchange redirect_uri used: {final_redirect_uri}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Failed to exchange Microsoft authorization code: {error_data.get('error_description', 'Unknown error')}"
                    )
                
                tokens = response.json()
                access_token = tokens.get("access_token")
                
                # Get user info from Microsoft Graph API
                user_info_url = "https://graph.microsoft.com/v1.0/me"
                headers = {"Authorization": f"Bearer {access_token}"}
                user_response = await client.get(user_info_url, headers=headers)
                
                if user_response.status_code != 200:
                    logger.error(f"Failed to get user info from Microsoft: {user_response.json()}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Failed to get user info from Microsoft"
                    )
                
                user_info = user_response.json()
            
            # Create or update user
            return await OAuthService._create_or_update_oauth_user(
                email=user_info.get("mail") or user_info.get("userPrincipalName"),
                provider=OAuthProvider.MICROSOFT,
                provider_user_id=user_info.get("id"),
                first_name=user_info.get("givenName", ""),
                last_name=user_info.get("surname", ""),
                profile_picture=None  # Microsoft Graph doesn't return profile picture in basic user info
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error handling Microsoft callback: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"OAuth authentication failed: {str(e)}"
            )
    
    @staticmethod
    async def _create_or_update_oauth_user(
        email: str,
        provider: OAuthProvider,
        provider_user_id: str,
        first_name: str,
        last_name: str,
        profile_picture: Optional[str] = None
    ) -> Tuple[User, str, str, Session]:
        """
        Create a new user or update existing user with OAuth info.
        
        Returns:
            Tuple of (user, access_token, refresh_token, session)
        """
        # Check if user exists
        user = await User.find_one(User.email == email.lower())
        
        if user:
            # Update existing user with OAuth info if not already linked
            oauth_provider_exists = any(
                p.provider == provider and p.provider_user_id == provider_user_id
                for p in user.oauth_providers
            )
            
            if not oauth_provider_exists:
                # Add new OAuth provider
                user.oauth_providers.append(OAuthProviderInfo(
                    provider=provider,
                    provider_user_id=provider_user_id,
                    linked_at=datetime.utcnow(),
                    email=email
                ))
                user.updated_at = datetime.utcnow()
                await user.save()
            
            # Mark email as verified for OAuth users
            if not user.is_email_verified:
                user.is_email_verified = True
                user.email_verification_token = None
                user.email_verification_expires = None
                await user.save()
        else:
            # Create new user with OAuth
            user = User(
                email=email.lower(),
                first_name=first_name,
                last_name=last_name,
                profile_picture=profile_picture,
                is_email_verified=True,  # OAuth emails are pre-verified
                oauth_providers=[OAuthProviderInfo(
                    provider=provider,
                    provider_user_id=provider_user_id,
                    linked_at=datetime.utcnow(),
                    email=email
                )],
                role=UserRole.USER,
                is_active=True
            )
            await user.insert()
        
        # Generate tokens using the security module
        jwt_access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
        jwt_refresh_token = create_refresh_token(data={"sub": str(user.id), "role": user.role.value})
        
        # Create session directly
        session_id = str(uuid.uuid4())
        session = Session(
            session_id=session_id,
            user_id=user.id,
            access_token_jti=secrets.token_urlsafe(32),
            refresh_token_jti=secrets.token_urlsafe(32),
            ip_address="unknown",  # Will be set by the calling function
            user_agent="unknown",
            expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        )
        await session.insert()
        
        return user, jwt_access_token, jwt_refresh_token, session
