"""
Video Plan Generator - Creates intelligent video plans using OpenAI.
Similar to HeyGen's video assistant - generates complete plans in one go.
"""
import os
from typing import Dict, Any, Optional
from openai import OpenAI


class VideoPlanGenerator:
    """Generates comprehensive video plans from user input."""
    
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        self.client = OpenAI(api_key=api_key)
    
    def generate_plan(
        self,
        user_input: str,
        uploaded_files_context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate a complete video plan from user input.
        
        Args:
            user_input: User's topic or description
            uploaded_files_context: Optional context from uploaded files
            
        Returns:
            Dictionary with complete video plan
        """
        # Build context for OpenAI
        context_prompt = ""
        if uploaded_files_context:
            context_prompt = f"\n\nAdditional context from uploaded files:\n{uploaded_files_context[:1000]}"
        
        system_prompt = """You are an intelligent AI video planning assistant (similar to HeyGen's video agent). 
Your task is to create a complete, professional video plan based on user input.

Generate a comprehensive video plan with these attributes:
- topic: Clear, engaging topic title
- audience: Target audience (e.g., "Beginners", "Professionals", "Students")
- music: Music theme/style (e.g., "Uplifting and motivational", "Calm and professional")
- duration: Video length (e.g., "30 seconds", "1 minute", "2 minutes")
- orientation: "Landscape" or "Portrait"
- script_plan: Brief description of script structure
- voice: Voice characteristics (e.g., "Male, professional, engaging")
- avatar: Avatar type (e.g., "AI presenter", "Professional narrator")
- captions: "Enabled" or "Disabled"
- tone: Overall tone (e.g., "Educational", "Promotional", "Informative")

Be concise, professional, and make intelligent assumptions based on the topic.
Return ONLY a JSON object with these fields, no additional text."""

        user_prompt = f"""Create a video plan for: {user_input}{context_prompt}

Return a JSON object with this exact structure:
{{
  "topic": "string",
  "audience": "string",
  "music": "string",
  "duration": "string",
  "orientation": "Landscape",
  "script_plan": "string",
  "voice": "string",
  "avatar": "string",
  "captions": "Enabled",
  "tone": "string"
}}"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
                max_tokens=500,
            )
            
            import json
            plan_data = json.loads(response.choices[0].message.content)
            
            # Ensure all required fields exist
            default_plan = {
                "topic": user_input.title(),
                "audience": "General audience",
                "music": "Uplifting and motivational",
                "duration": "30 seconds",
                "orientation": "Landscape",
                "script_plan": "Automatically generated from your input",
                "voice": "Male, professional, engaging",
                "avatar": "AI presenter",
                "captions": "Enabled",
                "tone": "Informative"
            }
            
            # Merge with defaults for missing fields
            plan = {**default_plan, **plan_data}
            
            return {
                "success": True,
                "plan": plan
            }
            
        except Exception as e:
            print(f"Error generating video plan: {e}")
            # Return fallback plan
            return {
                "success": True,
                "plan": {
                    "topic": user_input.title(),
                    "audience": "General audience",
                    "music": "Uplifting and motivational",
                    "duration": "30 seconds",
                    "orientation": "Landscape",
                    "script_plan": "Automatically generated from your input",
                    "voice": "Male, professional, engaging",
                    "avatar": "AI presenter",
                    "captions": "Enabled",
                    "tone": "Informative"
                }
            }
    
    def generate_plan_message(self, plan: Dict[str, Any]) -> str:
        """Generate a formatted message for the video plan."""
        message = f"""Great! A video about **{plan['topic']}**. Here's a proposed plan:

- **Topic**: {plan['topic']}
- **Audience**: {plan['audience']}
- **Music Theme**: {plan['music']}
- **Video Length**: ~{plan['duration']}
- **Orientation**: {plan['orientation']}
- **Script Plan**: {plan['script_plan']}
- **Voice**: {plan['voice']}
- **Avatar**: {plan['avatar']}
- **Captions**: {plan['captions']}

Would you like to proceed with this plan? (Yes/No)"""
        
        return message


def get_video_plan_generator() -> Optional[VideoPlanGenerator]:
    """Get video plan generator instance."""
    try:
        return VideoPlanGenerator()
    except Exception as e:
        print(f"Failed to initialize VideoPlanGenerator: {e}")
        return None

