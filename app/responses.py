"""
Base greetings and generic prompts for the chatbot.
"""
from typing import Dict, List
from datetime import datetime


def get_greeting() -> str:
    """Returns a friendly greeting based on time of day."""
    hour = datetime.now().hour
    
    if 5 <= hour < 12:
        return "Good morning! ☀️ I'm your AI content creation assistant. What would you like to create today?"
    elif 12 <= hour < 17:
        return "Good afternoon! 🌤️ I'm here to help you create amazing content. What can I help you with?"
    elif 17 <= hour < 21:
        return "Good evening! 🌆 Ready to create something awesome? What would you like to make?"
    else:
        return "Hey there! 🌙 I'm your AI content creation assistant. What would you like to create?"


def get_small_talk_responses() -> Dict[str, str]:
    """Returns responses for casual conversation."""
    return {
        "hi": "Hey there 👋 Ready to create something cool?",
        "hello": "Hello! 👋 What would you like to create today?",
        "hey": "Hey! 👋 Let's make something amazing together!",
        "good morning": "Good morning ☀️ What would you like to make today?",
        "good afternoon": "Good afternoon 🌤️ How can I help you create content?",
        "good evening": "Good evening 🌆 What would you like to create?",
        "how are you": "I'm doing great, thanks for asking! 😊 Ready to help you create something awesome!",
        "thanks": "You're welcome! Glad to help! 😊",
        "thank you": "You're very welcome! Happy to assist! 😊",
        "bye": "Goodbye! 👋 Come back anytime you need to create content!",
        "goodbye": "See you later! 👋 Happy creating!",
        "had dinner": "I don't eat dinner, but I'm here to help you create amazing content! 😊 What would you like to make?",
        "had lunch": "I don't eat lunch, but I'm always ready to help you create content! 😊 What would you like to make?",
        "had breakfast": "I don't eat breakfast, but I'm always ready to help you create content! 😊 What would you like to make today?",
    }


def get_content_type_prompt() -> str:
    """Asks user about the type of content they want to create."""
    return "What type of content would you like to create? I can help you with:\n\n" \
           "🎥 **Videos** - Create engaging video content\n" \
           "🖼️ **Images** - Generate beautiful images\n" \
           "📝 **Text** - Write articles, blogs, or documents\n" \
           "📚 **SCORM Courses** - Build interactive e-learning courses\n\n" \
           "Just let me know what you'd like to make!"


def get_confirmation_prompt() -> str:
    """Asks for confirmation before starting generation."""
    return "Perfect! I have all the information I need. Shall I start generating your content? 🚀"


def get_generation_started_message() -> str:
    """Message shown when content generation begins."""
    return "🎬 Perfect! I've started generating your content. This may take a few moments...\n\n⏳ Your content is being created now. I'll let you know when it's ready!"


def get_error_message() -> str:
    """Generic error message."""
    return "Oops! Something went wrong. 😅 Could you please try again?"


def get_restart_message() -> str:
    """Message when user restarts the session."""
    return "Starting fresh! 🆕 " + get_greeting()

