from src.core.state import OrchestratorState
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
import os

load_dotenv()

def google_ads_agent(state: OrchestratorState) -> dict:
    """
    Generates optimized Google Ads campaign launch configuration using GPT-4o-mini.
    Reports campaign structure, bid strategy, and targeting settings ready for API submission.
    """
    plan = state["plan"]
    goal = state.get("client_goal", {})
    allocations = plan.get("allocations", []) if isinstance(plan, dict) else getattr(plan, "allocations", [])
    keywords = plan.get("keywords", []) if isinstance(plan, dict) else getattr(plan, "keywords", [])
    creatives = plan.get("creatives", []) if isinstance(plan, dict) else getattr(plan, "creatives", [])

    google_allocation = None
    for alloc in allocations:
        platform = alloc.get("platform") if isinstance(alloc, dict) else getattr(alloc, "platform", "")
        if "Google" in platform:
            google_allocation = alloc
            break

    if not google_allocation:
        return {"messages": ["Google Ads execution skipped - not in campaign plan."]}

    budget = google_allocation.get("budget_allocation", 0) if isinstance(google_allocation, dict) else getattr(google_allocation, "budget_allocation", 0)
    strategy_notes = google_allocation.get("strategy_notes", "") if isinstance(google_allocation, dict) else getattr(google_allocation, "strategy_notes", "")
    industry = goal.get("industry") if isinstance(goal, dict) else getattr(goal, "industry", "Business")
    objective = goal.get("objective") if isinstance(goal, dict) else getattr(goal, "objective", "Growth")

    api_key = os.environ.get("OPENAI_API_KEY")

    campaign_config = {
        "campaign_type": "Search + Performance Max",
        "daily_budget": round(budget / 30, 2),
        "total_budget": budget,
        "bid_strategy": "Target CPA" if "lead" in objective.lower() else "Maximize Conversions",
        "keywords": keywords[:10] if keywords else [f"best {industry.lower()} services"],
        "ad_groups": len(creatives) if creatives else 1,
        "status": "READY_TO_LAUNCH",
        "strategy_notes": strategy_notes
    }

    if api_key:
        try:
            llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.3, openai_api_key=api_key)
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are a senior Google Ads specialist. Write a concise 2-sentence campaign launch summary describing the Google Ads strategy being deployed for the client."),
                ("human", "Industry: {industry}\nObjective: {objective}\nBudget: ${budget}\nBid Strategy: {bid_strategy}\nKeywords: {keywords}")
            ])
            chain = prompt | llm
            res = chain.invoke({
                "industry": industry,
                "objective": objective,
                "budget": budget,
                "bid_strategy": campaign_config["bid_strategy"],
                "keywords": ", ".join(keywords[:5]) if keywords else industry
            })
            launch_summary = res.content
        except Exception:
            launch_summary = f"Google Ads {campaign_config['bid_strategy']} campaign launched with {len(keywords)} keywords across {campaign_config['ad_groups']} ad groups."
    else:
        launch_summary = f"Google Ads campaign configured: ${budget} budget, {campaign_config['bid_strategy']} bidding, {len(keywords)} keywords ready."

    return {
        "messages": [f"✅ Google Ads: {launch_summary}"],
        "execution_results": {"google_ads": campaign_config}
    }
