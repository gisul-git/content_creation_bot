"""
FastAPI application entry point.
Final fix: Ensure Azure AD callback doesn't cause 307 redirects
"""
from fastapi import FastAPI, Request, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, RedirectResponse
from dotenv import load_dotenv
import os
import logging

from app.chat_routes import router as chat_router
from app.routes.auth import router as auth_router
from app.routes.oauth import router as oauth_router
from app.routes.admin import router as admin_router
from app.routes.users import router as users_router
from app.services.oauth_service import OAuthService
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection, connect_to_redis, close_redis_connection
from app.middleware.rate_limiter import limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from project root
from pathlib import Path
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# Create FastAPI app
app = FastAPI(
    title="AI Content Creation Chatbot API",
    description="API for AI-powered content creation chatbot",
    version="1.0.0",
    redirect_slashes=False  # IMPORTANT: Prevent automatic redirects for trailing slashes
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:5173"),
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Convert Pydantic validation errors to 400 Bad Request with clear messages."""
    errors = exc.errors()
    # Extract the first error message for clarity
    if errors:
        first_error = errors[0]
        error_msg = first_error.get("msg", "Validation error")
        error_field = " -> ".join(str(loc) for loc in first_error.get("loc", []))
        detail = f"{error_field}: {error_msg}" if error_field else error_msg
    else:
        detail = "Validation error"
    
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": detail}
    )


# CRITICAL: Define this callback BEFORE including routers
# This ensures it's registered first and handles the Azure AD callback
@app.get("/api/auth/callback/azure-ad")
async def azure_ad_callback(request: Request):
    """
    Handle Azure AD OAuth callback.
    
    This route is registered BEFORE other routers to prevent route conflicts.
    The redirect URI in Azure AD must be: http://localhost:8000/api/auth/callback/azure-ad
    """
    code = request.query_params.get("code")
    session_state = request.query_params.get("session_state")
    error = request.query_params.get("error")
    error_description = request.query_params.get("error_description")
    
    logger.info(f"Azure AD callback received - code present: {bool(code)}, error: {error}")
    
    if error:
        logger.error(f"Azure AD error: {error} - {error_description}")
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/login?error=oauth_error&message={error}",
            status_code=302  # Use 302, not 307
        )
    
    if not code:
        logger.error("No authorization code received from Azure AD")
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/login?error=no_code",
            status_code=302
        )
    
    try:
        # Use the EXACT same redirect URI that was sent in the authorization request
        redirect_uri = f"{settings.BACKEND_URL}/api/auth/callback/azure-ad"
        
        logger.info(f"Processing Microsoft OAuth with redirect_uri: {redirect_uri}")
        
        # Exchange code for tokens and create user/session
        user, access_token, refresh_token, session = await OAuthService.handle_microsoft_callback(
            code, 
            redirect_uri=redirect_uri
        )
        
        logger.info(f"Successfully authenticated user via Microsoft OAuth: {user.email}")
        
        # Option 1: Redirect with tokens in query (for testing/development)
        redirect_url = f"{settings.FRONTEND_URL}/auth/callback?access_token={access_token}&refresh_token={refresh_token}"
        
        # Option 2: Set httpOnly cookies (recommended for production)
        # Uncomment this block and remove the redirect_url above for production:
        """
        response = RedirectResponse(
            url=f"{settings.FRONTEND_URL}/dashboard",
            status_code=302
        )
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=True,  # Only over HTTPS in production
            samesite="lax",
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
        )
        return response
        """
        
        return RedirectResponse(url=redirect_url, status_code=302)
        
    except HTTPException as e:
        logger.error(f"HTTPException during Microsoft OAuth: {e.detail}")
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/login?error=oauth_failed&message={e.detail}",
            status_code=302
        )
    except Exception as e:
        logger.error(f"Unexpected error during Microsoft OAuth: {str(e)}", exc_info=True)
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/login?error=oauth_failed&message={str(e)}",
            status_code=302
        )


# Include routers AFTER defining the Azure AD callback
app.include_router(chat_router, prefix="/chat", tags=["chat"])
app.include_router(auth_router)
app.include_router(oauth_router)
app.include_router(admin_router)
app.include_router(users_router)


@app.on_event("startup")
async def startup_event():
    """Initialize database connections on startup."""
    logger.info("Starting up application...")
    await connect_to_mongo()
    await connect_to_redis()
    logger.info("Database connections established")


@app.on_event("shutdown")
async def shutdown_event():
    """Close database connections on shutdown."""
    logger.info("Shutting down application...")
    await close_mongo_connection()
    await close_redis_connection()
    logger.info("Database connections closed")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "AI Content Creation Chatbot API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
