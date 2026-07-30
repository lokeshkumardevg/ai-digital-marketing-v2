from src.core.state import OrchestratorState
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
import os

load_dotenv()

def meta_ads_agent(state: OrchestratorState) -> dict:
    """
    Generates optimized Meta (Facebook + Instagram) Ads campaign configuration using GPT-4o-mini.
    Reports audience targeting, placement strategy, and creative assignments for API submission.
    """
    plan = state["plan"]
    goal = state.get("client_goal", {})
    allocations = plan.get("allocations", []) if isinstance(plan, dict) else getattr(plan, "allocations", [])
    creatives = plan.get("creatives", []) if isinstance(plan, dict) else getattr(plan, "creatives", [])

    meta_allocation = None
    for alloc in allocations:
        platform = alloc.get("platform") if isinstance(alloc, dict) else getattr(alloc, "platform", "")
        if "Meta" in platform or "Facebook" in platform:
            meta_allocation = alloc
            break

    if not meta_allocation:
        return {"messages": ["Meta Ads execution skipped - not in campaign plan."]}

    budget = meta_allocation.get("budget_allocation", 0) if isinstance(meta_allocation, dict) else getattr(meta_allocation, "budget_allocation", 0)
    strategy_notes = meta_allocation.get("strategy_notes", "") if isinstance(meta_allocation, dict) else getattr(meta_allocation, "strategy_notes", "")
    industry = goal.get("industry") if isinstance(goal, dict) else getattr(goal, "industry", "Business")
    objective = goal.get("objective") if isinstance(goal, dict) else getattr(goal, "objective", "Growth")
    target_audience = goal.get("target_audience") if isinstance(goal, dict) else getattr(goal, "target_audience", "General audience")

    campaign_config = {
        "campaign_objective": "CONVERSIONS" if "sale" in objective.lower() or "lead" in objective.lower() else "BRAND_AWARENESS",
        "daily_budget": round(budget / 30, 2),
        "total_budget": budget,
        "placements": ["Facebook Feed", "Instagram Feed", "Instagram Stories", "Reels"],
        "ad_creatives_count": len(creatives),
        "target_audience": target_audience,
        "status": "READY_TO_LAUNCH",
        "strategy_notes": strategy_notes
    }

    api_key = os.environ.get("OPENAI_API_KEY")

    if api_key:
        try:
            llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.3, openai_api_key=api_key)
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are a senior Meta Ads specialist. Write a concise 2-sentence campaign launch summary describing the Meta Ads strategy being deployed for the client."),
                ("human", "Industry: {industry}\nObjective: {objective}\nBudget: ${budget}\nTarget Audience: {audience}\nCreatives: {num_creatives} ad variations")
            ])
            chain = prompt | llm
            res = chain.invoke({
                "industry": industry,
                "objective": objective,
                "budget": budget,
                "audience": target_audience,
                "num_creatives": len(creatives)
            })
            launch_summary = res.content
        except Exception:
            launch_summary = f"Meta Ads {campaign_config['campaign_objective']} campaign launched across {len(campaign_config['placements'])} placements with {len(creatives)} creative variations."
    else:
        launch_summary = f"Meta Ads campaign configured: ${budget} budget, {campaign_config['campaign_objective']} objective, {len(creatives)} creatives ready."

    return {
        "messages": [f"✅ Meta Ads: {launch_summary}"],
        "execution_results": {"meta_ads": campaign_config}
    }
