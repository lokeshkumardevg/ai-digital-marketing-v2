from src.core.state import OrchestratorState

def lead_generation_agent(state: OrchestratorState) -> dict:
    """
    Captures, enriches, and does initial qualification on leads arriving from ad campaigns.
    """
    leads_generated = 12
    return {
        "leads_generated": leads_generated,
        "messages": [f"Lead Generation: Captured and enriched {leads_generated} new leads."]
    }
