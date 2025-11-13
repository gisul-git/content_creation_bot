"""
Intent classification module - Detects user intent from messages.
"""
from typing import Optional, Literal
import re


IntentType = Literal["video", "image", "text", "scorm", "greeting", "small_talk", "unknown"]


def classify_intent(message: str) -> IntentType:
    """
    Classifies user intent from their message.
    
    Args:
        message: User's input message
        
    Returns:
        Intent type: video, image, text, scorm, greeting, small_talk, or unknown
    """
    message_lower = message.lower().strip()
    
    # Video intent
    video_keywords = ["video", "videos", "movie", "clip", "film", "recording", "animation"]
    if any(keyword in message_lower for keyword in video_keywords):
        return "video"
    
    # Image intent
    image_keywords = ["image", "images", "picture", "pictures", "photo", "photos", "graphic", "illustration"]
    if any(keyword in message_lower for keyword in image_keywords):
        return "image"
    
    # Text intent
    text_keywords = ["text", "article", "blog", "document", "write", "writing", "content", "essay"]
    if any(keyword in message_lower for keyword in text_keywords):
        return "text"
    
    # SCORM intent
    scorm_keywords = ["scorm", "course", "courses", "e-learning", "elearning", "training", "lesson"]
    if any(keyword in message_lower for keyword in scorm_keywords):
        return "scorm"
    
    # Greeting intent
    greeting_patterns = [
        r"^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening))",
        r"^(hi|hello|hey)\s+there",
    ]
    if any(re.match(pattern, message_lower) for pattern in greeting_patterns):
        return "greeting"
    
    # Small talk
    small_talk_keywords = ["thanks", "thank you", "bye", "goodbye", "how are you"]
    if any(keyword in message_lower for keyword in small_talk_keywords):
        return "small_talk"
    
    return "unknown"


def extract_content_type(message: str) -> Optional[str]:
    """
    Extracts content type from user message if explicitly mentioned.
    
    Args:
        message: User's input message
        
    Returns:
        Content type string or None
    """
    intent = classify_intent(message)
    
    if intent in ["video", "image", "text", "scorm"]:
        return intent
    
    return None

