from src.core.state import OrchestratorState

def microsoft_ads_agent(state: OrchestratorState) -> dict:
    """
    Runs search campaigns on the Microsoft Advertising network (Bing/Yahoo).
    """
    plan = state["plan"]
    allocations = plan.get("allocations", []) if isinstance(plan, dict) else plan.allocations
    
    ms_allocation = None
    for alloc in allocations:
        platform = alloc.get("platform") if isinstance(alloc, dict) else alloc.platform
        if platform == "Microsoft Ads":
            ms_allocation = alloc
            break
    
    if not ms_allocation:
        return {"messages": ["Microsoft Ads execution skipped - not in plan."]}
        
    budget = ms_allocation.get("budget_allocation", 0) if isinstance(ms_allocation, dict) else ms_allocation.budget_allocation
    
    return {
        "messages": [f"Microsoft Ads agent simulated launch: {budget} budget."],
        "execution_results": {"microsoft_ads": {"status": "live", "spend": 0.0, "roas": 0.0}}
    }
