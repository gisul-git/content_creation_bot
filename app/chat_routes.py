"""
Chat routes - Main chat flow handlers for FastAPI.
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Body
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
import os
import tempfile
from app.router_agent import RouterAgent
from app.session_store import session_store
from app.responses import get_restart_message
from app.utils.file_extractor import get_file_extractor
from app.summary_engine import get_summary_engine
from app.video_plan_generator import get_video_plan_generator


router = APIRouter()
router_agent = RouterAgent()


class ChatStartRequest(BaseModel):
    """Request model for starting a chat."""
    message: Optional[str] = None


class ChatAnswerRequest(BaseModel):
    """Request model for answering clarification questions."""
    session_id: str
    message: str


class ChatConfirmRequest(BaseModel):
    """Request model for confirming content generation."""
    session_id: str
    confirmed: bool = True


@router.post("/start")
async def start_chat(request: ChatStartRequest):
    """
    Initialize a new chat session.
    Returns greeting and session ID.
    """
    try:
        session_id = session_store.create_session()
        
        if request.message:
            # User sent a message, route it
            response = router_agent.route_request(session_id, request.message)
            return {
                "session_id": response["session_id"],
                "message": response["message"],
                "state": response["state"]
            }
        else:
            # No message, generate AI-powered greeting
            try:
                from app.conversation_engine import get_conversation_engine
                conversation_engine = get_conversation_engine()
                
                if conversation_engine:
                    # Use OpenAI for initial greeting
                    greeting = conversation_engine.generate_response(
                        "",
                        [],
                        {"state": "greeting", "fields": {}, "content_type": None},
                        None
                    )
                else:
                    # Fallback
                    from app.responses import get_greeting, get_content_type_prompt
                    greeting = get_greeting() + "\n\n" + get_content_type_prompt()
            except Exception as e:
                print(f"Error generating greeting with OpenAI: {e}")
                # Fallback to simple greeting
                from app.responses import get_greeting, get_content_type_prompt
                greeting = get_greeting() + "\n\n" + get_content_type_prompt()
            
            session_store.add_message(session_id, "assistant", greeting)
            
            return {
                "session_id": session_id,
                "message": greeting,
                "state": "greeting"
            }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting chat: {str(e)}")


@router.post("/answer")
async def answer_question(request: ChatAnswerRequest):
    """
    Process user answer during clarification phase.
    """
    try:
        # Check for restart keywords
        if request.message.lower().strip() in ["new", "restart", "start over"]:
            # Create new session
            new_session_id = session_store.create_session()
            greeting = get_restart_message()
            session_store.add_message(new_session_id, "assistant", greeting)
            
            return {
                "session_id": new_session_id,
                "message": greeting,
                "state": "greeting"
            }
        
        # Route the message
        response = router_agent.route_request(request.session_id, request.message)
        
        return {
            "session_id": response["session_id"],
            "message": response["message"],
            "state": response["state"]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing answer: {str(e)}")


@router.post("/confirm")
async def confirm_generation(request: ChatConfirmRequest):
    """
    Handle confirmation before content generation.
    """
    try:
        session = session_store.get_session(request.session_id)
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        if request.confirmed:
            session_store.update_session(request.session_id, {"state": "generating"})
            from app.responses import get_generation_started_message
            message = get_generation_started_message()
            session_store.add_message(request.session_id, "assistant", message)
            
            return {
                "session_id": request.session_id,
                "message": message,
                "state": "generating"
            }
        else:
            # User declined, go back to clarification
            content_type = session.get("content_type")
            session_store.update_session(request.session_id, {"state": "clarifying"})
            message = "No problem! What would you like to change?"
            session_store.add_message(request.session_id, "assistant", message)
            
            return {
                "session_id": request.session_id,
                "message": message,
                "state": "clarifying"
            }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error confirming: {str(e)}")


@router.get("/session/{session_id}")
async def get_session(session_id: str):
    """Get session data (for debugging)."""
    session = session_store.get_session(session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return session


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    session_id: Optional[str] = Form(None)
):
    """
    Upload and extract content from a file.
    Supports: PDF, DOCX, PPTX, TXT, JPG, PNG
    
    Automatically creates a session if session_id is not provided or invalid.
    """
    try:
        # Auto-create session if not provided or invalid
        if not session_id:
            session_id = session_store.create_session()
        else:
            session = session_store.get_session(session_id)
            if not session:
                # Session doesn't exist, create a new one
                session_id = session_store.create_session()
        
        # Get session (guaranteed to exist now)
        session = session_store.get_session(session_id)
        
        # Validate file type
        file_ext = os.path.splitext(file.filename)[1].lower()
        allowed_extensions = ['.pdf', '.docx', '.pptx', '.txt', '.jpg', '.jpeg', '.png']
        
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_path = tmp_file.name
        
        try:
            # Extract text from file
            extractor = get_file_extractor()
            extraction_result = extractor.extract(tmp_path, file.filename)
            
            if not extraction_result['success']:
                raise HTTPException(
                    status_code=500,
                    detail=extraction_result.get('error', 'Failed to extract content')
                )
            
            extracted_text = extraction_result['content']
            
            # Generate summary using OpenAI
            summary = ""
            summary_engine = get_summary_engine()
            if summary_engine and extracted_text:
                try:
                    # Use OpenAI to generate a concise summary
                    from openai import OpenAI
                    openai_api_key = os.getenv("OPENAI_API_KEY")
                    if openai_api_key:
                        client = OpenAI(api_key=openai_api_key)
                        response = client.chat.completions.create(
                            model="gpt-3.5-turbo",
                            messages=[
                                {"role": "system", "content": "You are a helpful assistant that creates concise summaries of documents."},
                                {"role": "user", "content": f"Summarize this document in 2-3 sentences:\n\n{extracted_text[:2000]}"}
                            ],
                            max_tokens=150,
                            temperature=0.7,
                        )
                        summary = response.choices[0].message.content.strip()
                    else:
                        summary = f"Extracted {len(extracted_text)} characters from {file.filename}"
                except Exception as e:
                    print(f"Error generating summary: {e}")
                    summary = f"Extracted {len(extracted_text)} characters from {file.filename}"
            
            # Initialize context if not exists
            if 'context' not in session:
                session['context'] = {
                    "files": [],
                    "extracted_text": "",
                    "summary": ""
                }
            
            # Add file info
            file_info = {
                "file_name": file.filename,
                "file_type": file_ext,
                "content": extracted_text,
                "summary": summary,
                "uploaded_at": datetime.now().isoformat()
            }
            
            session['context']['files'].append(file_info)
            session['context']['extracted_text'] += f"\n\n--- {file.filename} ---\n\n{extracted_text}"
            if summary:
                session['context']['summary'] += f"\n{file.filename}: {summary}\n"
            
            # Update session context (only update context, not entire session)
            session_store.update_session(session_id, {
                "context": session['context']
            })
            
            # Add message to chat
            if summary:
                upload_message = f"✅ File {file.filename} uploaded successfully.\n\n🧠 Summary: {summary}"
            else:
                upload_message = f"✅ File {file.filename} uploaded successfully. Extracted {len(extracted_text)} characters."
            
            session_store.add_message(session_id, "assistant", upload_message)
            
            # Return structured response matching requirements
            return {
                "success": True,
                "message": upload_message,
                "file_name": file.filename,
                "summary": summary if summary else f"Extracted {len(extracted_text)} characters",
                "content_length": len(extracted_text),
                "content": extracted_text,  # Include for editing
                "session_id": session_id,
                "chat_id": session_id  # Alias for compatibility
            }
        
        finally:
            # Clean up temporary file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


@router.post("/update_context")
async def update_context(request: Dict[str, Any] = Body(...)):
    """
    Update the extracted text context for a session.
    """
    try:
        session_id = request.get("session_id")
        new_content = request.get("content", "")
        
        if not session_id:
            raise HTTPException(status_code=400, detail="session_id is required")
        
        session = session_store.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Initialize context if not exists
        if 'context' not in session:
            session['context'] = {
                "files": [],
                "extracted_text": "",
                "summary": ""
            }
        
        # Update context
        session['context']['extracted_text'] = new_content
        session_store.update_session(session_id, session)
        
        return {
            "success": True,
            "message": "Context updated successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating context: {str(e)}")


class VideoPlanRequest(BaseModel):
    """Request model for generating video plan."""
    session_id: str
    topic: str
    message: Optional[str] = None


@router.post("/plan")
async def generate_video_plan(request: VideoPlanRequest):
    """
    Generate a complete video plan in a single response.
    Similar to HeyGen's video assistant - intelligent one-step planning.
    """
    try:
        # Validate session
        session = session_store.get_session(request.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Get uploaded files context if available
        uploaded_context = ""
        if 'context' in session and session['context'].get('extracted_text'):
            uploaded_context = session['context']['extracted_text']
        
        # Generate video plan
        plan_generator = get_video_plan_generator()
        if not plan_generator:
            raise HTTPException(
                status_code=500,
                detail="Video plan generator not available. Please check OpenAI API key."
            )
        
        # Generate plan
        result = plan_generator.generate_plan(
            user_input=request.topic,
            uploaded_files_context=uploaded_context if uploaded_context else None
        )
        
        if not result['success']:
            raise HTTPException(status_code=500, detail="Failed to generate video plan")
        
        plan = result['plan']
        
        # Store plan in session
        session_store.update_session(request.session_id, {
            "video_plan": plan,
            "state": "plan_ready"
        })
        
        # Generate formatted message
        bot_message = plan_generator.generate_plan_message(plan)
        
        # Add message to chat
        session_store.add_message(request.session_id, "assistant", bot_message)
        
        return {
            "status": "video_plan_ready",
            "plan": plan,
            "bot_message": bot_message,
            "session_id": request.session_id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating video plan: {str(e)}")

