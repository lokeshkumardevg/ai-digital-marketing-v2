from src.core.state import OrchestratorState
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from typing import List
from dotenv import load_dotenv
import os

load_dotenv()

class SocialPost(BaseModel):
    platform: str = Field(..., description="Platform name: 'Instagram', 'Twitter/X', or 'LinkedIn'")
    caption: str = Field(..., description="Full post caption with hashtags and call-to-action")
    scheduled_time: str = Field(..., description="Recommended schedule, e.g. 'Tomorrow 10:00 AM'")

class SocialPublishingOutput(BaseModel):
    posts: List[SocialPost] = Field(..., description="List of generated social media posts")

def social_publishing_agent(state: OrchestratorState) -> dict:
    """
    Generates dynamic, high-engagement organic social content using OpenAI GPT.
    """
    goal = state.get("client_goal", {})
    industry = goal.get("industry") if isinstance(goal, dict) else getattr(goal, "industry", "Digital Marketing")
    objective = goal.get("objective") if isinstance(goal, dict) else getattr(goal, "objective", "Brand Awareness")
    brand_context = state.get("brand_context", f"Industry: {industry}, Objective: {objective}")

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return {
            "social_posts_scheduled": 0,
            "messages": ["Social Publishing Error: OPENAI_API_KEY missing."]
        }

    try:
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7, openai_api_key=api_key)
        structured_llm = llm.with_structured_output(SocialPublishingOutput)

        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert Social Media Manager. Generate 3 engaging, platform-customized organic posts (Instagram, Twitter/X, LinkedIn) with emojis, relevant hashtags, and compelling calls-to-action."),
            ("human", "Brand Context:\n{brand_context}\n\nIndustry: {industry}\nGoal: {objective}")
        ])

        chain = prompt | structured_llm
        res = chain.invoke({
            "brand_context": brand_context,
            "industry": industry,
            "objective": objective
        })

        posts_data = res.get("posts", []) if isinstance(res, dict) else getattr(res, "posts", [])
        return {
            "social_posts_scheduled": len(posts_data),
            "execution_results": {"social_posts": [p.dict() if hasattr(p, "dict") else p for p in posts_data]},
            "messages": [f"Social Publishing: Successfully generated and scheduled {len(posts_data)} organic posts."]
        }
    except Exception as e:
        return {
            "social_posts_scheduled": 0,
            "errors": [f"Social Publishing Agent Error: {str(e)}"]
        }
