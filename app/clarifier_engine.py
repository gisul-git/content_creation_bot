"""
Clarifier engine - Handles field extraction and missing questions.
Enhanced with OpenAI for intelligent extraction.
"""
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from app.openai_clarifier import get_openai_clarifier


class ClarifierSchema(BaseModel):
    """Schema for different content types and their required fields."""
    video: Dict[str, Any] = {
        "topic": None,
        "duration": None,
        "style": None,
        "tone": None,
        "language": None,
        "resolution": None,
        "aspect_ratio": None,
    }
    image: Dict[str, Any] = {
        "topic": None,
        "style": None,
        "tone": None,
        "resolution": None,
        "aspect_ratio": None,
        "color_scheme": None,
    }
    text: Dict[str, Any] = {
        "topic": None,
        "length": None,
        "style": None,
        "tone": None,
        "language": None,
        "target_audience": None,
    }
    scorm: Dict[str, Any] = {
        "topic": None,
        "duration": None,
        "difficulty": None,
        "language": None,
        "interactive_elements": None,
        "assessment_type": None,
    }


class ClarifierEngine:
    """Engine for extracting fields and generating clarification questions."""
    
    def __init__(self):
        self.schema = ClarifierSchema()
        self.openai_clarifier = get_openai_clarifier()  # Try to get OpenAI clarifier
    
    def get_required_fields(self, content_type: str) -> Dict[str, Any]:
        """Get required fields for a content type."""
        return self.schema.model_dump().get(content_type, {})
    
    def extract_fields_from_message(
        self, 
        message: str, 
        content_type: str, 
        current_fields: Optional[Dict[str, Any]] = None,
        conversation_context: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Extract field values from user message.
        Uses OpenAI if available, otherwise falls back to pattern matching.
        """
        current_fields = current_fields or {}
        fields = self.get_required_fields(content_type)
        required_field_names = list(fields.keys())
        
        # Try OpenAI extraction first if available
        if self.openai_clarifier:
            try:
                extracted = self.openai_clarifier.extract_fields_intelligently(
                    message, 
                    content_type, 
                    current_fields,
                    required_field_names
                )
                if extracted:
                    return extracted
            except Exception as e:
                print(f"OpenAI extraction failed, using fallback: {e}")
        
        # Fallback to simple pattern matching
        message_lower = message.lower()
        extracted = {}
        
        patterns = {
            "duration": r"(\d+)\s*(min|minutes?|sec|seconds?|hour|hours?)",
            "length": r"(\d+)\s*(words?|pages?|paragraphs?)",
            "resolution": r"(\d+x\d+)|(hd|full hd|4k|8k)",
            "aspect_ratio": r"(\d+:\d+)|(16:9|4:3|1:1|9:16)",
        }
        
        for field, pattern in patterns.items():
            if field in fields:
                match = __import__('re').search(pattern, message_lower)
                if match:
                    extracted[field] = match.group(0)
        
        # Extract topic
        topic_keywords = ["about", "topic", "subject", "create", "make"]
        for keyword in topic_keywords:
            if keyword in message_lower:
                parts = message_lower.split(keyword, 1)
                if len(parts) > 1:
                    topic = parts[1].strip().split()[0:5]
                    extracted["topic"] = " ".join(topic)
                    break
        
        return extracted
    
    def get_missing_fields(self, session_data: Dict[str, Any], content_type: str) -> List[str]:
        """Get list of fields that are still missing."""
        required_fields = self.get_required_fields(content_type)
        missing = []
        
        for field, value in required_fields.items():
            if session_data.get(field) is None:
                missing.append(field)
        
        return missing
    
    def generate_question(
        self, 
        field: str, 
        content_type: str,
        current_fields: Optional[Dict[str, Any]] = None,
        conversation_context: Optional[List[Dict[str, str]]] = None
    ) -> str:
        """Generate a natural question for a missing field. Uses OpenAI if available."""
        current_fields = current_fields or {}
        
        # Try OpenAI question generation first
        if self.openai_clarifier:
            try:
                question = self.openai_clarifier.generate_natural_question(
                    field,
                    content_type,
                    current_fields,
                    conversation_context or []
                )
                if question:
                    return question
            except Exception as e:
                print(f"OpenAI question generation failed, using fallback: {e}")
        
        # Fallback to predefined questions
        questions = {
            "topic": "What topic or subject would you like your content to be about? 🎯",
            "duration": "How long should the content be? ⏱️ (e.g., 5 minutes, 30 seconds)",
            "length": "How long should the text be? 📏 (e.g., 500 words, 3 pages)",
            "style": "What style are you looking for? 🎨 (e.g., professional, casual, creative)",
            "tone": "What tone should it have? 😊 (e.g., friendly, formal, humorous)",
            "language": "What language should the content be in? 🌍",
            "resolution": "What resolution do you need? 📺 (e.g., 1920x1080, 4K)",
            "aspect_ratio": "What aspect ratio? 📐 (e.g., 16:9, 1:1, 9:16)",
            "color_scheme": "What color scheme would you like? 🎨 (e.g., vibrant, pastel, monochrome)",
            "target_audience": "Who is your target audience? 👥",
            "difficulty": "What difficulty level? 📚 (e.g., beginner, intermediate, advanced)",
            "interactive_elements": "What interactive elements do you want? 🎮 (e.g., quizzes, videos, simulations)",
            "assessment_type": "What type of assessment? 📝 (e.g., multiple choice, essay, project)",
        }
        
        return questions.get(field, f"Could you tell me more about {field.replace('_', ' ')}?")
    
    def get_next_question(
        self, 
        session_data: Dict[str, Any], 
        content_type: str,
        conversation_context: Optional[List[Dict[str, str]]] = None
    ) -> Optional[str]:
        """Get the next question to ask based on missing fields."""
        missing = self.get_missing_fields(session_data, content_type)
        
        if not missing:
            return None
        
        # Ask about the first missing field
        next_field = missing[0]
        return self.generate_question(
            next_field, 
            content_type,
            session_data,
            conversation_context
        )

