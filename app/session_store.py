"""
Session store - Manages chat sessions in-memory.
Can be extended to use Redis or SQLite for persistence.
"""
from typing import Dict, Optional, Any
from datetime import datetime
import uuid


class SessionStore:
    """In-memory session storage."""
    
    def __init__(self):
        self.sessions: Dict[str, Dict[str, Any]] = {}
    
    def create_session(self) -> str:
        """Create a new session and return session ID."""
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = {
            "session_id": session_id,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "state": "greeting",  # greeting, clarifying, confirming, generating
            "content_type": None,
            "fields": {},
            "messages": [],
            "user_name": None,
            "context": {
                "files": [],
                "extracted_text": "",
                "summary": ""
            }
        }
        return session_id
    
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session data by session ID."""
        return self.sessions.get(session_id)
    
    def update_session(self, session_id: str, updates: Dict[str, Any]) -> bool:
        """Update session data."""
        if session_id not in self.sessions:
            return False
        
        self.sessions[session_id].update(updates)
        self.sessions[session_id]["updated_at"] = datetime.now().isoformat()
        return True
    
    def add_message(self, session_id: str, role: str, content: str) -> bool:
        """Add a message to the session history."""
        if session_id not in self.sessions:
            return False
        
        message = {
            "role": role,  # "user" or "assistant"
            "content": content,
            "timestamp": datetime.now().isoformat(),
        }
        
        self.sessions[session_id]["messages"].append(message)
        self.sessions[session_id]["updated_at"] = datetime.now().isoformat()
        return True
    
    def update_field(self, session_id: str, field: str, value: Any) -> bool:
        """Update a specific field in the session."""
        if session_id not in self.sessions:
            return False
        
        if "fields" not in self.sessions[session_id]:
            self.sessions[session_id]["fields"] = {}
        
        self.sessions[session_id]["fields"][field] = value
        self.sessions[session_id]["updated_at"] = datetime.now().isoformat()
        return True
    
    def delete_session(self, session_id: str) -> bool:
        """Delete a session."""
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False
    
    def get_all_sessions(self) -> Dict[str, Dict[str, Any]]:
        """Get all sessions (for debugging/admin purposes)."""
        return self.sessions.copy()


# Global session store instance
session_store = SessionStore()

