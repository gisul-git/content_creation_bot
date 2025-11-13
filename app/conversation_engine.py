"""
Conversation Engine - Uses OpenAI to generate intelligent, contextual responses.
This replaces hardcoded responses with AI-powered conversational interactions.
"""
from typing import Dict, List, Optional, Any
import os
import json
from openai import OpenAI


class ConversationEngine:
    """Uses OpenAI to generate natural, contextual responses for all interactions."""
    
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        self.client = OpenAI(api_key=api_key)
    
    def generate_response(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        session_state: Dict[str, Any],
        content_type: Optional[str] = None
    ) -> str:
        """
        Generate an intelligent, contextual response using OpenAI.
        
        Args:
            user_message: Current user message
            conversation_history: Full conversation history
            session_state: Current session state (state, content_type, fields, etc.)
            content_type: Type of content being created (if any)
            
        Returns:
            Natural, contextual response string
        """
        # Build system prompt based on context
        system_prompt = self._build_system_prompt(session_state, content_type)
        
        # Build conversation context
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history (last 10 messages for context)
        for msg in conversation_history[-10:]:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role in ["user", "assistant"] and content:
                messages.append({"role": role, "content": content})
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                temperature=0.7,  # More creative for natural conversation
                max_tokens=200,
            )
            
            bot_response = response.choices[0].message.content.strip()
            return bot_response
        
        except Exception as e:
            print(f"Error generating OpenAI response: {e}")
            # Fallback to simple response
            return self._generate_fallback_response(user_message, session_state, content_type)
    
    def _build_system_prompt(self, session_state: Dict[str, Any], content_type: Optional[str]) -> str:
        """Build system prompt based on current session state."""
        state = session_state.get("state", "greeting")
        fields = session_state.get("fields", {})
        
        base_prompt = """You are a friendly, helpful AI content creation assistant. You help users create videos, images, text, or SCORM courses through natural conversation.

IMPORTANT: If the user has uploaded files, you have access to the extracted content from those files. Use this context to answer questions and create content based on the uploaded materials.

Your personality:
- Warm, friendly, and enthusiastic
- Use emojis appropriately (but not too many)
- Be conversational and natural
- Show genuine interest in helping users create content
- Keep responses concise (1-3 sentences typically)

"""
        
        if state == "greeting":
            return base_prompt + """Current situation: User is just starting. They might be greeting you or asking about content creation.

Your task:
- Greet them warmly if they're greeting you
- If they mention wanting to create something, acknowledge it and start gathering information
- Be friendly and inviting
- Ask what type of content they'd like to create (video, image, text, SCORM course)

Examples:
- User: "Hi" → "Hey there! 👋 I'm excited to help you create amazing content! What would you like to make today - a video, image, text, or SCORM course?"
- User: "I want to make a video" → "Awesome! 🎥 I'd love to help you create a video. Let me ask you a few questions to get started..."
"""
        
        elif state == "clarifying":
            collected_fields = {k: v for k, v in fields.items() if v is not None}
            missing_fields = [k for k, v in fields.items() if v is None]
            
            fields_info = f"""
Content type: {content_type}
Information we have so far: {json.dumps(collected_fields, indent=2) if collected_fields else "None yet"}
Information we still need: {', '.join(missing_fields) if missing_fields else 'All information collected!'}
"""
            
            return base_prompt + f"""Current situation: We're gathering information to create {content_type} content.
{fields_info}

Your task:
- Extract any new information from the user's message
- If they provide information, acknowledge it positively
- Ask about the NEXT missing piece of information in a natural, conversational way
- Don't ask multiple questions at once
- Be encouraging and friendly

Examples:
- If they say "about Python programming" → "Great! Python programming sounds interesting! 🐍 How long should the video be?"
- If they provide duration → "Perfect! ⏱️ What style are you going for - professional, casual, or something else?"
"""
        
        elif state == "confirming":
            # Build detailed summary for confirmation
            fields_info = ""
            if fields:
                fields_list = []
                for key, value in fields.items():
                    if value:
                        field_name = key.replace('_', ' ').title()
                        fields_list.append(f"  • {field_name}: {value}")
                if fields_list:
                    fields_info = "\n" + "\n".join(fields_list)
            
            return base_prompt + f"""Current situation: We have all the information needed for the {content_type}. We're asking for confirmation.

Here's what we'll create:
📋 Content Type: {content_type.title()}{fields_info}

Your task:
- Show a comprehensive summary with ALL details
- Format it clearly with bullet points
- Ask if they're ready to proceed
- Be enthusiastic about creating their content
- Use emoji appropriately

Format your response like:
"Here's what I'll create for you:

📋 Content Type: {content_type.title()}
  • [Field 1]: [Value 1]
  • [Field 2]: [Value 2]
  • [All other fields...]

✨ Does this look good? Type 'yes' to proceed with generation, or let me know what you'd like to change!"
"""
        
        else:
            return base_prompt + "Respond naturally to the user's message. Be helpful and friendly."
    
    def _generate_fallback_response(
        self, 
        user_message: str, 
        session_state: Dict[str, Any],
        content_type: Optional[str]
    ) -> str:
        """Generate a simple fallback response if OpenAI fails."""
        msg_lower = user_message.lower().strip()
        
        # Simple greeting detection
        if any(word in msg_lower for word in ["hi", "hello", "hey", "haii"]):
            return "Hey there! 👋 I'm your AI content creation assistant. What would you like to create today?"
        
        # Content type detection
        if "video" in msg_lower:
            return "Great! I'd love to help you create a video. What topic would you like it to be about?"
        elif "image" in msg_lower:
            return "Awesome! Let's create an image. What would you like it to be about?"
        elif "text" in msg_lower or "article" in msg_lower:
            return "Perfect! I can help you write text content. What topic are you thinking about?"
        elif "scorm" in msg_lower or "course" in msg_lower:
            return "Excellent! Let's create a SCORM course. What subject would you like to cover?"
        
        return "I'm here to help you create amazing content! What would you like to make - a video, image, text, or SCORM course?"


def get_conversation_engine() -> Optional[ConversationEngine]:
    """Get conversation engine instance, returns None if OpenAI key is not configured."""
    try:
        return ConversationEngine()
    except ValueError:
        return None

