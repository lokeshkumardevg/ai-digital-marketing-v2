from src.core.state import OrchestratorState

def meta_ads_agent(state: OrchestratorState) -> dict:
    """
    Manages Facebook and Instagram campaigns — audience targeting, placements, creative testing.
    """
    plan = state["plan"]
    allocations = plan.get("allocations", []) if isinstance(plan, dict) else plan.allocations
    
    meta_allocation = None
    for alloc in allocations:
        platform = alloc.get("platform") if isinstance(alloc, dict) else alloc.platform
        if platform == "Meta Ads":
            meta_allocation = alloc
            break
    
    if not meta_allocation:
        return {"messages": ["Meta Ads execution skipped - not in plan."]}
        
    budget = meta_allocation.get("budget_allocation", 0) if isinstance(meta_allocation, dict) else meta_allocation.budget_allocation
    
    return {
        "messages": [f"Meta Ads agent simulated launch: {budget} budget."],
        "execution_results": {"meta_ads": {"status": "live", "spend": 0.0, "roas": 0.0}}
    }
