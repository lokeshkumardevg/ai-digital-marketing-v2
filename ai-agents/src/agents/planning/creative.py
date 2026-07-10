from src.core.state import OrchestratorState
from src.models.campaign import CreativeAsset
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from typing import List
import os

class CreativeOutput(BaseModel):
    creatives: List[CreativeAsset] = Field(..., description="A list of generated ad copy variants and image prompts.")

def creative_agent(state: OrchestratorState) -> dict:
    """
    Generates ad copy, headlines, image/video prompts based on strategy using OpenAI GPT.
    """
    goal = state["client_goal"]
    plan = state["plan"]
    brand_context = state.get("brand_context", "Use general industry knowledge.")
    
    objective = goal.get("objective") if isinstance(goal, dict) else goal.objective
    industry = goal.get("industry") if isinstance(goal, dict) else goal.industry
    target_audience = goal.get("target_audience") if isinstance(goal, dict) else goal.target_audience
    
    if not os.environ.get("OPENAI_API_KEY"):
        creatives = [CreativeAsset(headline="Mock Ad", description="Mock Desc", image_prompt="Mock Prompt")]
        if isinstance(plan, dict):
            plan["creatives"] = creatives
        else:
            plan.creatives = creatives
            
        return {
            "plan": plan,
            "messages": ["Creative: OPENAI_API_KEY missing. Falling back to Mock logic."]
        }

    # [SPEED OPTIMIZATION] Using GPT-4o-mini which is incredibly fast for generation
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
    structured_llm = llm.with_structured_output(CreativeOutput)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert digital marketing copywriter. Write highly converting ad headlines, descriptions, and visual image prompts for the client's industry and goal. Make sure to match the tone and mention features from the brand context! Return exactly 3 distinct creative variations."),
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
        
        creatives = response.get("creatives", []) if isinstance(response, dict) else response.creatives
        
        if isinstance(plan, dict):
            plan["creatives"] = creatives
        else:
            plan.creatives = creatives
            
        return {
            "plan": plan,
            "messages": [f"Creative: AI generated {len(creatives)} creative assets."]
        }
        
    except Exception as e:
        return {
            "errors": [f"Creative Agent Error: {str(e)}"]
        }
