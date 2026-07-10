from fastapi import APIRouter, HTTPException
from src.models.campaign import CampaignGoal, CampaignPlan
from src.core.state import OrchestratorState
from src.core.workflow import app_workflow

router = APIRouter()

@router.post("/run-campaign", response_model=OrchestratorState)
async def run_campaign(goal: CampaignGoal):
    initial_state = OrchestratorState(
        client_goal=goal,
        plan=CampaignPlan(),
        brand_context="",
        current_step="init",
        errors=[],
        messages=["Starting orchestrator workflow"],
        execution_results={},
        insights=[],
        anomalies=[],
        budget_shifts=[],
        reviews_generated=0,
        review_responses=[],
        social_posts_scheduled=0,
        social_engagements=[],
        listings_updated=0,
        leads_generated=0,
        crm_segments_updated=0,
        templates_created=0,
        custom_tasks_run=0
    )
    
    try:
        # Run the langgraph workflow
        result = app_workflow.invoke(initial_state)
        return result
    except Exception as e:
        import traceback
        with open("error.log", "w") as f:
            traceback.print_exc(file=f)
        raise HTTPException(status_code=500, detail=str(e))
