import operator
from typing import List, Dict, Any, Annotated
from typing_extensions import TypedDict
from src.models.campaign import CampaignGoal, CampaignPlan

def merge_dicts(a: Dict[str, Any], b: Dict[str, Any]) -> Dict[str, Any]:
    if not a: a = {}
    if not b: b = {}
    return {**a, **b}

def add_ints(a: int, b: int) -> int:
    if not a: a = 0
    if not b: b = 0
    return a + b

class OrchestratorState(TypedDict):
    client_goal: CampaignGoal
    plan: CampaignPlan
    brand_context: str
    current_step: str
    errors: Annotated[List[str], operator.add]
    messages: Annotated[List[str], operator.add]
    # Phase 2 additions
    execution_results: Annotated[Dict[str, Any], merge_dicts]
    insights: Annotated[List[str], operator.add]
    anomalies: Annotated[List[str], operator.add]
    budget_shifts: Annotated[List[str], operator.add]
    # Phase 3 additions
    reviews_generated: Annotated[int, add_ints]
    review_responses: Annotated[List[str], operator.add]
    social_posts_scheduled: Annotated[int, add_ints]
    social_engagements: Annotated[List[str], operator.add]
    # Phase 4 additions
    listings_updated: Annotated[int, add_ints]
    leads_generated: Annotated[int, add_ints]
    crm_segments_updated: Annotated[int, add_ints]
    # Phase 5 additions
    templates_created: Annotated[int, add_ints]
    custom_tasks_run: Annotated[int, add_ints]
