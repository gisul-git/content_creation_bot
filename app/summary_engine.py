"""
Summary engine - Uses OpenAI API to generate natural summaries.
"""
from typing import Dict, Any, Optional
import os
from openai import OpenAI


class SummaryEngine:
    """Generates natural language summaries using OpenAI."""
    
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        self.client = OpenAI(api_key=api_key)
    
    def generate_summary(self, content_type: str, fields: Dict[str, Any]) -> str:
        """
        Generate a comprehensive, formatted summary of the content request.
        
        Args:
            content_type: Type of content (video, image, text, scorm)
            fields: Dictionary of field values
            
        Returns:
            Formatted summary string with all details
        """
        # Build detailed field description
        field_descriptions = []
        for key, value in fields.items():
            if value:
                # Format field name nicely
                field_name = key.replace('_', ' ').title()
                field_descriptions.append(f"  • {field_name}: {value}")
        
        fields_text = "\n".join(field_descriptions) if field_descriptions else "  • No specific details provided."
        
        prompt = f"""You are a helpful AI assistant. Generate a comprehensive, well-formatted summary of a content creation request that will be shown to the user for approval.

Content Type: {content_type.title()}
All Details Collected:
{fields_text}

Generate a clear, formatted summary that:
1. Starts with "Here's what I'll create for you:"
2. Lists ALL the details in a clear, organized way
3. Uses a warm, professional tone
4. Includes emoji where appropriate
5. Ends with asking for confirmation
6. Format it nicely with clear sections

Make it comprehensive - the user should see ALL the details they provided before approving.

Summary:"""
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful AI assistant that creates comprehensive, well-formatted summaries for content creation requests."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300,
                temperature=0.7,
            )
            
            summary = response.choices[0].message.content.strip()
            return summary
        
        except Exception as e:
            # Fallback to detailed summary if OpenAI fails
            return self._generate_detailed_fallback_summary(content_type, fields)
    
    def _generate_detailed_fallback_summary(self, content_type: str, fields: Dict[str, Any]) -> str:
        """Generate a detailed fallback summary without OpenAI."""
        summary_lines = ["Here's what I'll create for you:\n"]
        summary_lines.append(f"📋 Content Type: {content_type.title()}\n")
        
        # Add all fields in a formatted way
        for key, value in fields.items():
            if value:
                field_name = key.replace('_', ' ').title()
                summary_lines.append(f"  • {field_name}: {value}")
        
        summary_lines.append("\n✨ Does this look good? Type 'yes' to proceed with generation, or let me know what you'd like to change!")
        
        return "\n".join(summary_lines)


def get_summary_engine() -> Optional[SummaryEngine]:
    """Get summary engine instance, returns None if OpenAI key is not configured."""
    try:
        return SummaryEngine()
    except ValueError:
        return None

