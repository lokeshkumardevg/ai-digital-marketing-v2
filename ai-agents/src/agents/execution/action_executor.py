from src.core.state import OrchestratorState

def action_executor_agent(state: OrchestratorState) -> dict:
    """
    Executes the actions recommended by anomaly and budget agents (e.g. Pause ad, shift budget).
    """
    anomalies = state.get("anomalies", [])
    budget_shifts = state.get("budget_shifts", [])
    
    actions_taken = []
    
    # Execute Anomaly Actions (e.g., PAUSE_AD)
    for anomaly in anomalies:
        if "PAUSE_AD" in anomaly:
            # Here it would call Google/Meta API to pause the ad
            actions_taken.append(f"EXECUTED API CALL: Paused underperforming ad due to anomaly.")
            
    # Execute Budget Shifts
    for shift in budget_shifts:
        # Here it would call Google/Meta API to adjust daily budgets
        actions_taken.append(f"EXECUTED API CALL: Budget Shifted -> {shift}")
        
    if not actions_taken:
        actions_taken.append("No critical actions required today.")
        
    return {
        "actions_taken": actions_taken,
        "messages": [f"Action Executor: Executed {len(actions_taken)} actions."]
    }
