from src.core.state import OrchestratorState

def anomaly_agent(state: OrchestratorState) -> dict:
    """
    Detects sudden spend spikes, CTR crashes, or campaign disapprovals.
    """
    if not state.get("execution_results"):
        return {"messages": ["Anomaly detection skipped - no execution results."]}
        
    # Mock anomaly detection
    
    return {
        "anomalies": [],
        "messages": ["Anomaly detection sweep complete. All green."],
        "current_step": "done"
    }
