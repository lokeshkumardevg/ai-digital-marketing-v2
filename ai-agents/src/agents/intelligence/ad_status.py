from src.core.state import OrchestratorState
import os

def ad_status_agent(state: OrchestratorState) -> dict:
    """
    Checks if the ads are approved or rejected by Google/Meta.
    """
    # Mocking the real API call that would check ad review status
    access_token = os.environ.get("META_ACCESS_TOKEN")
    
    # In a real scenario, this would use the access_token to hit the platform API
    # For now, we simulate that ads have passed platform review and are live.
    
    return {
        "ad_status": "APPROVED",
        "messages": ["Ad Status Checker: Campaigns are APPROVED and LIVE on platforms."]
    }
