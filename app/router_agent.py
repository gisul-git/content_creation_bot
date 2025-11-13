"""
Router agent - Routes requests appropriately based on session state.
"""
from typing import Dict, Any, Optional
from app.intent_classifier import classify_intent, extract_content_type
from app.clarifier_engine import ClarifierEngine
from app.responses import (
    get_greeting,
    get_content_type_prompt,
    get_confirmation_prompt,
    get_generation_started_message,
)
from app.session_store import session_store
from app.summary_engine import get_summary_engine
from app.openai_clarifier import get_openai_clarifier
from app.conversation_engine import get_conversation_engine


class RouterAgent:
    """Routes chat requests based on session state and user intent."""
    
    def __init__(self):
        self.clarifier = ClarifierEngine()
        self.openai_clarifier = get_openai_clarifier()
        self.conversation_engine = get_conversation_engine()  # For AI-powered responses
    
    def route_request(self, session_id: str, message: str) -> Dict[str, Any]:
        """
        Route a user message based on session state.
        
        Args:
            session_id: Current session ID
            message: User's message
            
        Returns:
            Response dictionary with bot message and updated state
        """
        session = session_store.get_session(session_id)
        
        if not session:
            # Create new session if it doesn't exist
            session_id = session_store.create_session()
            session = session_store.get_session(session_id)
        
        state = session.get("state", "greeting")
        content_type = session.get("content_type")
        
        # Add user message to history
        session_store.add_message(session_id, "user", message)
        
        # Route based on state
        if state == "greeting":
            return self._handle_greeting(session_id, message)
        elif state == "clarifying":
            return self._handle_clarification(session_id, message, content_type)
        elif state == "confirming":
            return self._handle_confirmation(session_id, message)
        else:
            return self._handle_greeting(session_id, message)
    
    def _handle_greeting(self, session_id: str, message: str) -> Dict[str, Any]:
        """Handle greeting phase - use OpenAI for all responses."""
        session = session_store.get_session(session_id)
        conversation_history = session.get("messages", [])
        
        # Check if there's file context to use
        context = session.get("context", {})
        file_context = context.get("extracted_text", "")
        
        # Use OpenAI conversation engine for intelligent response
        if self.conversation_engine:
            try:
                # Generate AI-powered response (with file context if available)
                context = session.get("context", {})
                file_context = context.get("extracted_text", "")
                
                # If there's file context, include it in the conversation
                enhanced_message = message
                if file_context:
                    enhanced_message = f"{message}\n\n[Context from uploaded files: {file_context[:1000]}...]"
                
                bot_message = self.conversation_engine.generate_response(
                    enhanced_message if file_context else message,
                    conversation_history,
                    session,
                    None
                )
                
                # Check if user mentioned content type using OpenAI
                if self.openai_clarifier:
                    try:
                        intent_result = self.openai_clarifier.understand_user_intent(message, conversation_history)
                        content_type = intent_result.get("content_type")
                        
                        if content_type:
                            # User wants to create content - transition to clarifying
                            session_store.update_session(session_id, {
                                "content_type": content_type,
                                "state": "clarifying"
                            })
                            # Generate new response for content creation
                            bot_message = self.conversation_engine.generate_response(
                                message,
                                conversation_history,
                                session_store.get_session(session_id),
                                content_type
                            )
                    except Exception as e:
                        print(f"OpenAI intent detection failed: {e}")
                
            except Exception as e:
                print(f"OpenAI conversation engine failed: {e}")
                # Fallback to basic response
                bot_message = get_greeting() + "\n\n" + get_content_type_prompt()
        else:
            # Fallback if OpenAI not available
            intent = classify_intent(message)
            content_type = extract_content_type(message)
            
            if content_type:
                session_store.update_session(session_id, {
                    "content_type": content_type,
                    "state": "clarifying"
                })
                bot_message = f"Great! You want to create a {content_type}. Let me gather some details."
            else:
                bot_message = get_greeting() + "\n\n" + get_content_type_prompt()
        
        session_store.add_message(session_id, "assistant", bot_message)
        
        return {
            "session_id": session_id,
            "message": bot_message,
            "state": session_store.get_session(session_id)["state"]
        }
    
    def _handle_clarification(self, session_id: str, message: str, content_type: str) -> Dict[str, Any]:
        """Handle clarification phase - use OpenAI for intelligent extraction and responses."""
        session = session_store.get_session(session_id)
        fields = session.get("fields", {})
        conversation_history = session.get("messages", [])
        
        # Extract fields from message using OpenAI if available
        extracted = self.clarifier.extract_fields_from_message(
            message, 
            content_type,
            fields,
            conversation_history
        )
        fields.update(extracted)
        
        # Update session with extracted fields
        for field, value in extracted.items():
            session_store.update_field(session_id, field, value)
        
        # Check if all fields are filled
        missing = self.clarifier.get_missing_fields(fields, content_type)
        
        # Use OpenAI conversation engine for response
        if self.conversation_engine:
            try:
                # Update session state
                updated_session = session_store.get_session(session_id)
                if not missing:
                    session_store.update_session(session_id, {"state": "confirming"})
                    updated_session = session_store.get_session(session_id)
                
                # Generate AI-powered response
                bot_message = self.conversation_engine.generate_response(
                    message,
                    conversation_history,
                    updated_session,
                    content_type
                )
            except Exception as e:
                print(f"OpenAI conversation engine failed: {e}")
                # Fallback - show comprehensive summary
                if not missing:
                    session_store.update_session(session_id, {"state": "confirming"})
                    summary_engine = get_summary_engine()
                    if summary_engine:
                        summary = summary_engine.generate_summary(content_type, fields)
                        bot_message = summary
                    else:
                        # Fallback summary
                        summary_lines = ["Here's what I'll create for you:\n"]
                        summary_lines.append(f"📋 Content Type: {content_type.title()}\n")
                        for key, value in fields.items():
                            if value:
                                field_name = key.replace('_', ' ').title()
                                summary_lines.append(f"  • {field_name}: {value}")
                        summary_lines.append("\n✨ Does this look good? Type 'yes' to proceed with generation!")
                        bot_message = "\n".join(summary_lines)
                else:
                    next_question = self.clarifier.get_next_question(fields, content_type, conversation_history)
                    bot_message = next_question or "Could you provide a bit more information?"
        else:
            # Fallback if OpenAI not available
            if not missing:
                session_store.update_session(session_id, {"state": "confirming"})
                summary_engine = get_summary_engine()
                if summary_engine:
                    summary = summary_engine.generate_summary(content_type, fields)
                    bot_message = summary
                else:
                    # Fallback summary
                    summary_lines = ["Here's what I'll create for you:\n"]
                    summary_lines.append(f"📋 Content Type: {content_type.title()}\n")
                    for key, value in fields.items():
                        if value:
                            field_name = key.replace('_', ' ').title()
                            summary_lines.append(f"  • {field_name}: {value}")
                    summary_lines.append("\n✨ Does this look good? Type 'yes' to proceed with generation!")
                    bot_message = "\n".join(summary_lines)
            else:
                next_question = self.clarifier.get_next_question(fields, content_type, conversation_history)
                bot_message = next_question or "Could you provide a bit more information?"
        
        session_store.add_message(session_id, "assistant", bot_message)
        
        return {
            "session_id": session_id,
            "message": bot_message,
            "state": session_store.get_session(session_id)["state"]
        }
    
    def _handle_confirmation(self, session_id: str, message: str) -> Dict[str, Any]:
        """Handle confirmation phase - start generation or go back."""
        message_lower = message.lower().strip()
        
        # Check for confirmation
        confirm_keywords = ["yes", "yep", "yeah", "sure", "ok", "okay", "go", "start", "proceed", "confirm"]
        if any(keyword in message_lower for keyword in confirm_keywords):
            session_store.update_session(session_id, {"state": "generating"})
            bot_message = get_generation_started_message()
            
            session_store.add_message(session_id, "assistant", bot_message)
            
            return {
                "session_id": session_id,
                "message": bot_message,
                "state": "generating"
            }
        else:
            # User wants to change something, go back to clarification
            session = session_store.get_session(session_id)
            content_type = session.get("content_type")
            session_store.update_session(session_id, {"state": "clarifying"})
            
            bot_message = "No problem! What would you like to change?"
            session_store.add_message(session_id, "assistant", bot_message)
            
            return {
                "session_id": session_id,
                "message": bot_message,
                "state": "clarifying"
            }

