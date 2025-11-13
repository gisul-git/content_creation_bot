"""
OpenAI-powered clarifier - Uses OpenAI API for intelligent field extraction and question generation.
"""
from typing import Dict, List, Optional, Any
import os
import json
from openai import OpenAI


class OpenAIClarifier:
    """Uses OpenAI to intelligently extract fields and generate natural questions."""
    
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        self.client = OpenAI(api_key=api_key)
    
    def extract_fields_intelligently(
        self, 
        message: str, 
        content_type: str, 
        current_fields: Dict[str, Any],
        required_fields: List[str]
    ) -> Dict[str, Any]:
        """
        Use OpenAI to intelligently extract field values from user message.
        
        Args:
            message: User's message
            content_type: Type of content (video, image, text, scorm)
            current_fields: Already collected fields
            required_fields: List of required field names
            
        Returns:
            Dictionary of extracted field values
        """
        # Build context about what we already know
        known_fields = {k: v for k, v in current_fields.items() if v is not None}
        missing_fields = [f for f in required_fields if current_fields.get(f) is None]
        
        system_prompt = f"""You are an AI assistant helping to collect information for creating {content_type} content.

Your task is to extract relevant information from the user's message, even if the grammar is imperfect or the message is casual.

Current information we have:
{json.dumps(known_fields, indent=2) if known_fields else "None yet"}

Fields we still need: {', '.join(missing_fields) if missing_fields else 'All fields collected'}

Extract any relevant information from the user's message. Return ONLY a JSON object with the field names as keys and extracted values as values.
If a field is not mentioned or unclear, don't include it.
Be flexible with grammar and understand the user's intent even if the message is informal.

Example for video content:
User: "i want make video about cooking 5 min professional style"
Response: {{"topic": "cooking", "duration": "5 minutes", "style": "professional"}}

Return only valid JSON, no other text."""

        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ],
                temperature=0.3,
                max_tokens=200,
            )
            
            result_text = response.choices[0].message.content.strip()
            
            # Try to parse JSON response
            # Remove markdown code blocks if present
            if result_text.startswith("```"):
                result_text = result_text.split("```")[1]
                if result_text.startswith("json"):
                    result_text = result_text[4:]
                result_text = result_text.strip()
            
            extracted = json.loads(result_text)
            return extracted
        
        except (json.JSONDecodeError, Exception) as e:
            # Fallback to empty dict if parsing fails
            print(f"Error extracting fields with OpenAI: {e}")
            return {}
    
    def generate_natural_question(
        self,
        field: str,
        content_type: str,
        current_fields: Dict[str, Any],
        conversation_context: List[Dict[str, str]]
    ) -> str:
        """
        Generate a natural, conversational question using OpenAI.
        
        Args:
            field: The field we need to ask about
            content_type: Type of content being created
            current_fields: Fields we've already collected
            conversation_context: Recent conversation history
            
        Returns:
            Natural question string
        """
        known_info = {k: v for k, v in current_fields.items() if v is not None}
        
        system_prompt = f"""You are a friendly AI assistant helping users create {content_type} content.

You need to ask about: {field}

Information we already have:
{json.dumps(known_info, indent=2) if known_info else "None yet"}

Generate a friendly, natural question to ask the user about {field}. 
- Be conversational and warm
- Use emoji appropriately (but not too many)
- Make it feel like a natural conversation
- Don't be too formal
- Keep it concise (1-2 sentences max)

Examples:
- For "topic": "What would you like your {content_type} to be about? 🎯"
- For "duration": "How long should it be? ⏱️"
- For "style": "What style are you going for? 🎨"

Return only the question, no other text."""

        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                ],
                temperature=0.7,
                max_tokens=100,
            )
            
            question = response.choices[0].message.content.strip()
            return question
        
        except Exception as e:
            print(f"Error generating question with OpenAI: {e}")
            # Fallback to simple question
            return f"Could you tell me about {field.replace('_', ' ')}?"
    
    def understand_user_intent(self, message: str, conversation_history: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Use OpenAI to better understand user intent and extract content type.
        
        Args:
            message: User's message
            conversation_history: Recent conversation
            
        Returns:
            Dictionary with intent, content_type, and confidence
        """
        system_prompt = """You are an AI assistant that helps users create content.

Analyze the user's message and determine:
1. What type of content they want to create (video, image, text, scorm, or none)
2. If they're greeting you
3. If it's small talk (like "had dinner", "had breakfast", casual conversation)

Common small talk includes:
- Food/meal questions: "had dinner", "had breakfast", "had lunch"
- Greetings: "hi", "hello", "good morning"
- Casual chat: "how are you", "what's up"

Return a JSON object with:
- "intent": one of ["video", "image", "text", "scorm", "greeting", "small_talk", "unknown"]
- "content_type": the content type if mentioned, or null
- "confidence": a number between 0 and 1

Be flexible with grammar and understand intent even from casual messages.
If the message is clearly small talk (like asking about meals, greetings, casual chat), return "small_talk" as intent.

Return only valid JSON."""

        try:
            messages = [{"role": "system", "content": system_prompt}]
            # Add recent conversation context
            for msg in conversation_history[-3:]:  # Last 3 messages
                messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
            messages.append({"role": "user", "content": message})
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                temperature=0.3,
                max_tokens=150,
            )
            
            result_text = response.choices[0].message.content.strip()
            
            # Remove markdown if present
            if result_text.startswith("```"):
                result_text = result_text.split("```")[1]
                if result_text.startswith("json"):
                    result_text = result_text[4:]
                result_text = result_text.strip()
            
            result = json.loads(result_text)
            return result
        
        except Exception as e:
            print(f"Error understanding intent with OpenAI: {e}")
            return {"intent": "unknown", "content_type": None, "confidence": 0.0}


def get_openai_clarifier() -> Optional[OpenAIClarifier]:
    """Get OpenAI clarifier instance, returns None if OpenAI key is not configured."""
    try:
        return OpenAIClarifier()
    except ValueError:
        return None

