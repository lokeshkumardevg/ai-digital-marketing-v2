from src.core.state import OrchestratorState

def google_ads_agent(state: OrchestratorState) -> dict:
    """
    Creates, manages, and optimizes Search, Display, YouTube, and Performance Max campaigns.
    """
    plan = state["plan"]
    allocations = plan.get("allocations", []) if isinstance(plan, dict) else plan.allocations
    
    # Check if Google Ads is in the allocations
    google_allocation = None
    for alloc in allocations:
        platform = alloc.get("platform") if isinstance(alloc, dict) else alloc.platform
        if platform == "Google Ads":
            google_allocation = alloc
            break
    
    if not google_allocation:
        return {"messages": ["Google Ads execution skipped - not in plan."]}
        
    # Mocking API execution
    budget = google_allocation.get("budget_allocation", 0) if isinstance(google_allocation, dict) else google_allocation.budget_allocation
    creatives = plan.get("creatives", []) if isinstance(plan, dict) else plan.creatives
    num_creatives = len(creatives)
    
    return {
        "messages": [f"Google Ads agent simulated launch: {budget} budget, {num_creatives} creatives."],
        "execution_results": {"google_ads": {"status": "live", "spend": 0.0, "roas": 0.0}}
    }
