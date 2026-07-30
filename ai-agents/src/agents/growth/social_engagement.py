from src.core.state import OrchestratorState
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from typing import List
from dotenv import load_dotenv
import os

load_dotenv()

class EngagementAction(BaseModel):
    user_interaction: str = Field(..., description="The user comment or DM received")
    action_type: str = Field(..., description="Type of action: 'Public Reply', 'Private DM', 'Like & Acknowledge'")
    ai_response: str = Field(..., description="On-brand automated reply")

class SocialEngagementOutput(BaseModel):
    engagements: List[EngagementAction] = Field(..., description="List of social engagement actions taken")

def social_engagement_agent(state: OrchestratorState) -> dict:
    """
    Handles incoming social media comments, mentions, and DMs using OpenAI GPT.
    """
    goal = state.get("client_goal", {})
    industry = goal.get("industry") if isinstance(goal, dict) else getattr(goal, "industry", "Business")

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return {
            "social_engagements": [],
            "messages": ["Social Engagement Error: OPENAI_API_KEY missing."]
        }

    try:
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.5, openai_api_key=api_key)
        structured_llm = llm.with_structured_output(SocialEngagementOutput)

        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an AI Social Community Manager. Draft 2 engaging, friendly responses to sample incoming social media interactions for a {industry} brand (1 product pricing query, 1 praise comment)."),
            ("human", "Industry: {industry}")
        ])

        chain = prompt | structured_llm
        res = chain.invoke({"industry": industry})

        engagements_data = res.get("engagements", []) if isinstance(res, dict) else getattr(res, "engagements", [])
        formatted_list = [f"{e.action_type}: {e.ai_response}" if hasattr(e, "action_type") else str(e) for e in engagements_data]

        return {
            "social_engagements": formatted_list,
            "messages": [f"Social Engagement: AI successfully responded to {len(formatted_list)} incoming community interactions."]
        }
    except Exception as e:
        return {
            "social_engagements": [],
            "errors": [f"Social Engagement Agent Error: {str(e)}"]
        }
