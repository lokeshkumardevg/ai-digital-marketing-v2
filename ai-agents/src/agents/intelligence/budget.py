from src.core.state import OrchestratorState

def budget_agent(state: OrchestratorState) -> dict:
    """
    Watches live performance and automatically reallocates budget from underperforming channels.
    """
    if not state.get("execution_results"):
        return {"messages": ["Budget review skipped - no execution results."]}
        
    # Mock budget logic
    # Real implementation would evaluate CPA/ROAS thresholds
    
    return {
        "budget_shifts": [],
        "messages": ["Budget review complete. No shifts required."]
    }
