from src.core.state import OrchestratorState

def insights_agent(state: OrchestratorState) -> dict:
    """
    Pulls performance data from every platform, finds patterns, and generates human-readable insights.
    """
    if not state.get("execution_results"):
        return {"messages": ["Insights generation skipped - no execution results."]}
        
    # Mocking insights generation based on execution results
    insights = []
    
    platforms = list(state["execution_results"].keys())
    if len(platforms) > 1:
        insights.append(f"Campaign is live across {len(platforms)} platforms.")
    
    return {
        "insights": insights,
        "messages": ["Insights generated."]
    }
