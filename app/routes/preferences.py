"""
User preferences routes.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any

from app.models.user import User
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api/users", tags=["preferences"])


class PreferencesModel(BaseModel):
    """User preferences model."""
    theme: Optional[str] = "auto"  # light, dark, auto
    fontSize: Optional[str] = "medium"  # small, medium, large
    codeTheme: Optional[str] = "github"  # github, monokai, dracula
    autoScroll: Optional[bool] = True
    showTimestamps: Optional[bool] = True
    compactMode: Optional[bool] = False


@router.get("/preferences")
async def get_preferences(
    current_user: User = Depends(get_current_user)
):
    """Get user preferences."""
    try:
        preferences = current_user.preferences or {}
        
        # Return with defaults
        return {
            "theme": preferences.get("theme", "auto"),
            "fontSize": preferences.get("fontSize", "medium"),
            "codeTheme": preferences.get("codeTheme", "github"),
            "autoScroll": preferences.get("autoScroll", True),
            "showTimestamps": preferences.get("showTimestamps", True),
            "compactMode": preferences.get("compactMode", False),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get preferences: {str(e)}")


@router.put("/preferences")
async def update_preferences(
    preferences: PreferencesModel,
    current_user: User = Depends(get_current_user)
):
    """Update user preferences."""
    try:
        from datetime import datetime
        
        # Get current preferences or initialize
        if not current_user.preferences:
            current_user.preferences = {}
        
        # Update preferences (convert Pydantic model to dict)
        pref_dict = preferences.dict(exclude_unset=True)
        current_user.preferences.update(pref_dict)
        current_user.updated_at = datetime.utcnow()
        await current_user.save()
        
        return {
            "success": True,
            "preferences": current_user.preferences
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update preferences: {str(e)}")

