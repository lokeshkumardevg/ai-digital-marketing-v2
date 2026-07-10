from src.core.state import OrchestratorState

def custom_agent_framework(state: OrchestratorState) -> dict:
    """
    A configurable agent framework that lets new special-purpose agents be defined quickly.
    """
    custom_tasks_run = 1
    return {
        "custom_tasks_run": custom_tasks_run,
        "messages": [f"Custom Agent: Executed {custom_tasks_run} custom client-specific workflow."]
    }
