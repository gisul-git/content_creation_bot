"""
Chat and Message models for storing conversation history.
"""
from beanie import Document
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class Message(BaseModel):
    """Message model within a chat."""
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    file_url: Optional[str] = None
    reactions: List[str] = []  # ['👍', '👎', '❤️', etc.]
    is_regenerated: bool = False


class Chat(Document):
    """Chat document model."""
    user_id: str  # Reference to User (ObjectId as string)
    title: str  # First message or custom title
    session_id: str  # Link to existing session
    messages: List[Message] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_deleted: bool = False
    is_shared: bool = False
    share_token: Optional[str] = None
    shared_at: Optional[datetime] = None
    
    class Settings:
        name = "chats"
        indexes = [
            [("user_id", 1), ("created_at", -1)],  # For user's chat history
            [("session_id", 1)],  # For session lookup
            [("share_token", 1)],  # For shared chat lookup
            [("is_deleted", 1), ("user_id", 1)],  # For non-deleted chats
        ]

