from src.core.state import OrchestratorState
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from typing import List
import os

class KeywordOutput(BaseModel):
    keywords: List[str] = Field(..., description="A list of targeted SEO and PPC keywords.")

def keyword_agent(state: OrchestratorState) -> dict:
    """
    Generates high-converting keywords based on the client's industry and goal using OpenAI GPT.
    """
    goal = state["client_goal"]
    plan = state["plan"]
    brand_context = state.get("brand_context", "Use general industry knowledge.")
    
    objective = goal.get("objective") if isinstance(goal, dict) else goal.objective
    industry = goal.get("industry") if isinstance(goal, dict) else goal.industry
    target_audience = goal.get("target_audience") if isinstance(goal, dict) else goal.target_audience
    
    if not os.environ.get("OPENAI_API_KEY"):
        return {
            "errors": ["Keyword Agent Error: OPENAI_API_KEY is not configured in the environment. Cannot perform keyword research."]
        }

    # [SPEED OPTIMIZATION] Using GPT-4o-mini which is incredibly fast for generation
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
    structured_llm = llm.with_structured_output(KeywordOutput)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an elite digital marketing keyword planner and data analyst. Based on the client's industry, brand context, and precise objective, generate an extremely accurate list of exactly 10 high-intent, high-converting semantic keywords. Do NOT generate generic or placeholder keywords like 'mock-keyword'. The output must contain realistic, search-volume-driven, bottom-of-the-funnel keywords appropriate for Google Ads and Microsoft Ads."),
        ("human", "Brand Context (Scraped from website):\n{brand_context}\n\nObjective: {objective}\nIndustry: {industry}\nTarget Audience: {target_audience}")
    ])
    
    chain = prompt | structured_llm
    
    try:
        response = chain.invoke({
            "brand_context": brand_context,
            "objective": objective,
            "industry": industry,
            "target_audience": target_audience
        })
        
        keywords = response.get("keywords", []) if isinstance(response, dict) else response.keywords
        
        if isinstance(plan, dict):
            plan["keywords"] = keywords
        else:
            plan.keywords = keywords
            
        return {
            "plan": plan,
            "current_step": "creative",
            "messages": [f"Keyword Planner: AI generated {len(keywords)} highly targeted keywords."]
        }
        
    except Exception as e:
        return {
            "errors": [f"Keyword Agent Error: {str(e)}"]
        }
