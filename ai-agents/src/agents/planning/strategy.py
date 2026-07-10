from src.core.state import OrchestratorState
from src.models.campaign import PlatformAllocation
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from typing import List
import os

class StrategyOutput(BaseModel):
    allocations: List[PlatformAllocation] = Field(..., description="The list of platform budget allocations.")

def strategy_agent(state: OrchestratorState) -> dict:
    """
    Decides which platform, how much budget, which audience based on goals using OpenAI GPT.
    """
    goal = state["client_goal"]
    plan = state["plan"]
    brand_context = state.get("brand_context", "Use general industry knowledge.")
    
    objective = goal.get("objective") if isinstance(goal, dict) else goal.objective
    industry = goal.get("industry") if isinstance(goal, dict) else goal.industry
    target_audience = goal.get("target_audience") if isinstance(goal, dict) else goal.target_audience
    budget = goal.get("budget") if isinstance(goal, dict) else goal.budget
    
    # Check if API key exists; if not, fallback to mock to prevent crashing
    if not os.environ.get("OPENAI_API_KEY"):
        # Fallback Mock logic
        allocations = [
            PlatformAllocation(
                platform="Google Ads",
                budget_allocation=budget * 0.7,
                strategy_notes="Mock fallback strategy"
            )
        ]
        if isinstance(plan, dict):
            plan["allocations"] = allocations
        else:
            plan.allocations = allocations
            
        return {
            "plan": plan,
            "current_step": "creative",
            "messages": ["Strategy: OPENAI_API_KEY missing. Falling back to Mock logic."]
        }

    llm = ChatOpenAI(model="gpt-4o", temperature=0)
    structured_llm = llm.with_structured_output(StrategyOutput)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert digital marketing strategist. Your job is to allocate a marketing budget across platforms (Google Ads, Meta Ads, LinkedIn Ads, Microsoft Ads, X Ads) based on the client's industry, budget, and objective. You must return EXACTLY a list of platform allocations that sum up to the total budget."),
        ("human", "Brand Context (Scraped from website):\n{brand_context}\n\nClient Goal: {objective}\nIndustry: {industry}\nTarget Audience: {target_audience}\nTotal Budget: ${budget}")
    ])
    
    chain = prompt | structured_llm
    
    try:
        response = chain.invoke({
            "brand_context": brand_context,
            "objective": objective,
            "industry": industry,
            "target_audience": target_audience,
            "budget": budget
        })
        
        allocations = response.get("allocations", []) if isinstance(response, dict) else response.allocations
        
        if isinstance(plan, dict):
            plan["allocations"] = allocations
        else:
            plan.allocations = allocations
            
        return {
            "plan": plan,
            "current_step": "creative",
            "messages": [f"Strategy: AI generated {len(allocations)} platform allocations."]
        }
        
    except Exception as e:
        return {
            "errors": [f"Strategy Agent Error: {str(e)}"]
        }
