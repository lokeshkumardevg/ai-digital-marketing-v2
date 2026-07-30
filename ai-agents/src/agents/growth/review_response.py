from src.core.state import OrchestratorState
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from typing import List
from dotenv import load_dotenv
import os

load_dotenv()

class SingleResponse(BaseModel):
    sentiment: str = Field(..., description="Review sentiment: 'Positive', 'Neutral', or 'Negative'")
    customer_review: str = Field(..., description="The review text being answered")
    ai_reply: str = Field(..., description="On-brand, professional response addressing the customer's feedback")

class ReviewResponseOutput(BaseModel):
    responses: List[SingleResponse] = Field(..., description="List of drafted review replies")

def review_response_agent(state: OrchestratorState) -> dict:
    """
    Analyzes customer reviews and drafts AI sentiment-aware responses using OpenAI GPT.
    """
    goal = state.get("client_goal", {})
    industry = goal.get("industry") if isinstance(goal, dict) else getattr(goal, "industry", "Business")

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return {
            "review_responses": [],
            "messages": ["Review Response Error: OPENAI_API_KEY missing."]
        }

    try:
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.4, openai_api_key=api_key)
        structured_llm = llm.with_structured_output(ReviewResponseOutput)

        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an AI Customer Care Specialist for a {industry} company. Draft 2 thoughtful, professional review replies: one for a 5-star positive review, and one for a 2-star constructive feedback review. Address concerns with empathy and offer solutions."),
            ("human", "Industry: {industry}")
        ])

        chain = prompt | structured_llm
        res = chain.invoke({"industry": industry})

        responses_data = res.get("responses", []) if isinstance(res, dict) else getattr(res, "responses", [])
        formatted_replies = [r.ai_reply if hasattr(r, "ai_reply") else r.get("ai_reply", "") for r in responses_data]

        return {
            "review_responses": formatted_replies,
            "messages": [f"Review Response: AI successfully drafted {len(formatted_replies)} sentiment-aware customer replies."]
        }
    except Exception as e:
        return {
            "review_responses": [],
            "errors": [f"Review Response Error: {str(e)}"]
        }
