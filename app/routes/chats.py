"""
Chat routes for managing user conversations.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import secrets
import asyncio
import json

from app.models.chat import Chat, Message
from app.models.user import User
from app.core.dependencies import get_current_user
from app.core.config import settings
from app.router_agent import RouterAgent

router_agent = RouterAgent()

router = APIRouter(prefix="/api/chats", tags=["chats"])


@router.get("/", response_model=List[Chat])
async def get_user_chats(
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """Get all chats for current user."""
    try:
        chats = await Chat.find(
            Chat.user_id == str(current_user.id),
            Chat.is_deleted == False
        ).sort(-Chat.updated_at).skip(skip).limit(limit).to_list()
        return chats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch chats: {str(e)}")


@router.get("/{chat_id}", response_model=Chat)
async def get_chat(
    chat_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get specific chat."""
    try:
        from bson import ObjectId
        if not ObjectId.is_valid(chat_id):
            raise HTTPException(status_code=400, detail="Invalid chat ID format")
        
        chat = await Chat.get(chat_id)
        if not chat or chat.user_id != str(current_user.id) or chat.is_deleted:
            raise HTTPException(status_code=404, detail="Chat not found")
        return chat
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch chat: {str(e)}")


class CreateChatRequest(BaseModel):
    """Request model for creating a chat."""
    session_id: str
    title: str = "New Chat"


@router.post("/", response_model=Chat)
async def create_chat(
    request: CreateChatRequest,
    current_user: User = Depends(get_current_user)
):
    """Create new chat."""
    try:
        chat = Chat(
            user_id=str(current_user.id),
            session_id=request.session_id,
            title=request.title,
            messages=[]
        )
        await chat.insert()
        # Ensure id is properly set (Beanie sets it after insert)
        if not chat.id:
            raise ValueError("Chat ID was not set after insert")
        
        # Refresh to ensure all fields are set
        await chat.fetch()
        
        return chat
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error creating chat: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to create chat: {str(e)}")


class AddMessageRequest(BaseModel):
    """Request model for adding a message."""
    role: str
    content: str
    file_url: Optional[str] = None


@router.put("/{chat_id}/messages")
async def add_message(
    chat_id: str,
    message: AddMessageRequest,
    current_user: User = Depends(get_current_user)
):
    """Add message to chat."""
    try:
        from bson import ObjectId
        
        # Validate chat_id format
        if not chat_id or chat_id == 'undefined':
            raise HTTPException(status_code=400, detail="Chat ID is required")
        
        if not ObjectId.is_valid(chat_id):
            raise HTTPException(status_code=400, detail=f"Invalid chat ID format: {chat_id}")
        
        try:
            chat = await Chat.get(chat_id)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to fetch chat: {str(e)}")
        
        if not chat or chat.user_id != str(current_user.id) or chat.is_deleted:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        new_message = Message(
            role=message.role,
            content=message.content,
            file_url=message.file_url,
            timestamp=datetime.utcnow()
        )
        
        chat.messages.append(new_message)
        chat.updated_at = datetime.utcnow()
        
        # Update title if first user message
        if len(chat.messages) == 1 and message.role == 'user':
            chat.title = message.content[:50] + ('...' if len(message.content) > 50 else '')
        
        await chat.save()
        return {"success": True, "message": new_message}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add message: {str(e)}")


@router.delete("/{chat_id}")
async def delete_chat(
    chat_id: str,
    current_user: User = Depends(get_current_user)
):
    """Soft delete chat."""
    try:
        from bson import ObjectId
        if not chat_id or chat_id == 'undefined' or not ObjectId.is_valid(chat_id):
            raise HTTPException(status_code=400, detail="Invalid chat ID format")
        
        chat = await Chat.get(chat_id)
        if not chat or chat.user_id != str(current_user.id):
            raise HTTPException(status_code=404, detail="Chat not found")
        
        chat.is_deleted = True
        chat.updated_at = datetime.utcnow()
        await chat.save()
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete chat: {str(e)}")


@router.get("/search/", response_model=List[Chat])
async def search_chats(
    query: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_user),
    limit: int = Query(20, ge=1, le=100)
):
    """Search chats by content."""
    try:
        # MongoDB text search across title and message content
        chats = await Chat.find(
            Chat.user_id == str(current_user.id),
            Chat.is_deleted == False,
            {
                "$or": [
                    {"title": {"$regex": query, "$options": "i"}},
                    {"messages.content": {"$regex": query, "$options": "i"}}
                ]
            }
        ).limit(limit).to_list()
        return chats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.post("/{chat_id}/share")
async def share_chat(
    chat_id: str,
    current_user: User = Depends(get_current_user)
):
    """Generate shareable link."""
    try:
        from bson import ObjectId
        if not chat_id or chat_id == 'undefined' or not ObjectId.is_valid(chat_id):
            raise HTTPException(status_code=400, detail="Invalid chat ID format")
        
        chat = await Chat.get(chat_id)
        if not chat or chat.user_id != str(current_user.id) or chat.is_deleted:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        chat.is_shared = True
        chat.share_token = secrets.token_urlsafe(32)
        chat.shared_at = datetime.utcnow()
        await chat.save()
        
        share_url = f"{settings.FRONTEND_URL}/shared/{chat.share_token}"
        return {"share_url": share_url, "token": chat.share_token}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to share chat: {str(e)}")


@router.get("/shared/{token}", response_model=Chat)
async def get_shared_chat(token: str):
    """Get shared chat (public, no auth required)."""
    try:
        chat = await Chat.find_one(
            Chat.share_token == token,
            Chat.is_shared == True
        )
        if not chat:
            raise HTTPException(status_code=404, detail="Shared chat not found")
        return chat
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch shared chat: {str(e)}")


@router.delete("/{chat_id}/share")
async def unshare_chat(
    chat_id: str,
    current_user: User = Depends(get_current_user)
):
    """Remove share link."""
    try:
        from bson import ObjectId
        if not chat_id or chat_id == 'undefined' or not ObjectId.is_valid(chat_id):
            raise HTTPException(status_code=400, detail="Invalid chat ID format")
        
        chat = await Chat.get(chat_id)
        if not chat or chat.user_id != str(current_user.id):
            raise HTTPException(status_code=404, detail="Chat not found")
        
        chat.is_shared = False
        chat.share_token = None
        chat.shared_at = None
        await chat.save()
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to unshare chat: {str(e)}")


@router.post("/{chat_id}/messages/{message_index}/reaction")
async def toggle_reaction(
    chat_id: str,
    message_index: int,
    reaction: str = Query(..., description="Emoji reaction (e.g., 👍, ❤️)"),
    current_user: User = Depends(get_current_user)
):
    """Toggle reaction on message."""
    try:
        from bson import ObjectId
        if not chat_id or chat_id == 'undefined' or not ObjectId.is_valid(chat_id):
            raise HTTPException(status_code=400, detail="Invalid chat ID format")
        
        chat = await Chat.get(chat_id)
        if not chat or chat.user_id != str(current_user.id) or chat.is_deleted:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        if message_index < 0 or message_index >= len(chat.messages):
            raise HTTPException(status_code=400, detail="Invalid message index")
        
        message = chat.messages[message_index]
        
        if reaction in message.reactions:
            message.reactions.remove(reaction)
        else:
            message.reactions.append(reaction)
        
        chat.updated_at = datetime.utcnow()
        await chat.save()
        return {"success": True, "reactions": message.reactions}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to toggle reaction: {str(e)}")


@router.get("/{chat_id}/messages")
async def get_chat_messages(
    chat_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user)
):
    """Get paginated messages from chat."""
    try:
        from bson import ObjectId
        if not chat_id or chat_id == 'undefined' or not ObjectId.is_valid(chat_id):
            raise HTTPException(status_code=400, detail="Invalid chat ID format")
        
        chat = await Chat.get(chat_id)
        if not chat or chat.user_id != str(current_user.id) or chat.is_deleted:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        total = len(chat.messages)
        messages = chat.messages[skip:skip + limit]
        
        return {
            "messages": messages,
            "total": total,
            "skip": skip,
            "limit": limit
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch messages: {str(e)}")


class StreamMessageRequest(BaseModel):
    """Request model for streaming messages."""
    message: str


@router.post("/{chat_id}/stream")
async def stream_message(
    chat_id: str,
    request: StreamMessageRequest,
    current_user: User = Depends(get_current_user)
):
    """Stream AI response in real-time."""
    
    async def generate():
        try:
            from bson import ObjectId
            if not chat_id or chat_id == 'undefined' or not ObjectId.is_valid(chat_id):
                yield json.dumps({"error": "Invalid chat ID format", "done": True}) + "\n"
                return
            
            chat = await Chat.get(chat_id)
            if not chat or chat.user_id != str(current_user.id) or chat.is_deleted:
                yield json.dumps({"error": "Chat not found", "done": True}) + "\n"
                return
            
            # Add user message
            user_msg = Message(
                role='user',
                content=request.message,
                timestamp=datetime.utcnow()
            )
            chat.messages.append(user_msg)
            chat.updated_at = datetime.utcnow()
            
            # Update title if first user message
            if len(chat.messages) == 1:
                chat.title = request.message[:50] + ('...' if len(request.message) > 50 else '')
            
            # Save user message immediately
            await chat.save()
            
            # Stream AI response using router agent
            session_id = chat.session_id
            full_response = ""
            
            # NOTE: This is currently simulating streaming by chunking a complete response
            # In production, integrate with actual streaming AI service (OpenAI streaming API, etc.)
            # For now, we fetch the full response and chunk it for UX purposes
            try:
                response = router_agent.route_request(session_id, request.message)
                ai_message_text = response.get("message", "")
                
                # Stream in chunks for better UX (chunking complete response)
                # TODO: Replace with real streaming when router_agent supports it:
                # async for chunk in router_agent.stream_request(session_id, request.message):
                #     full_response += chunk
                #     yield json.dumps({"chunk": chunk, "done": False}) + "\n"
                
                chunk_size = 10  # Characters per chunk
                for i in range(0, len(ai_message_text), chunk_size):
                    chunk = ai_message_text[i:i + chunk_size]
                    full_response += chunk
                    yield json.dumps({"chunk": chunk, "done": False}) + "\n"
                    await asyncio.sleep(0.01)  # Small delay for smooth streaming
                
                # Save AI message ONCE at the end (not during streaming)
                ai_msg = Message(
                    role='assistant',
                    content=full_response,
                    timestamp=datetime.utcnow()
                )
                chat.messages.append(ai_msg)
                chat.updated_at = datetime.utcnow()
                await chat.save()
                
                yield json.dumps({"chunk": "", "done": True, "full_response": full_response}) + "\n"
            except Exception as e:
                error_msg = f"Error generating response: {str(e)}"
                yield json.dumps({"error": error_msg, "done": True}) + "\n"
        except Exception as e:
            yield json.dumps({"error": f"Stream failed: {str(e)}", "done": True}) + "\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")


@router.post("/{chat_id}/regenerate/{message_index}")
async def regenerate_response(
    chat_id: str,
    message_index: int,
    current_user: User = Depends(get_current_user)
):
    """Regenerate AI response for a specific message."""
    try:
        from bson import ObjectId
        if not chat_id or chat_id == 'undefined' or not ObjectId.is_valid(chat_id):
            raise HTTPException(status_code=400, detail="Invalid chat ID format")
        
        chat = await Chat.get(chat_id)
        if not chat or chat.user_id != str(current_user.id) or chat.is_deleted:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        if message_index < 0 or message_index >= len(chat.messages):
            raise HTTPException(status_code=400, detail="Invalid message index")
        
        # Get the user message before the AI response
        if message_index == 0:
            raise HTTPException(status_code=400, detail="Cannot regenerate first message")
        
        user_message = chat.messages[message_index - 1]
        if user_message.role != 'user':
            raise HTTPException(status_code=400, detail="Previous message is not a user message")
        
        # Generate new response using router agent
        session_id = chat.session_id
        response = router_agent.route_request(session_id, user_message.content)
        new_response = response.get("message", "")
        
        # Update message
        chat.messages[message_index].content = new_response
        chat.messages[message_index].is_regenerated = True
        chat.updated_at = datetime.utcnow()
        await chat.save()
        
        return {
            "success": True,
            "new_content": new_response,
            "message": chat.messages[message_index]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to regenerate response: {str(e)}")

