from fastapi import APIRouter, HTTPException
from src.models.campaign import CampaignGoal, CampaignPlan
from src.core.state import OrchestratorState
from src.core.workflow import creation_workflow, optimization_workflow

router = APIRouter()

@router.post("/create-campaign", response_model=OrchestratorState)
async def create_campaign(goal: CampaignGoal):
    """
    Endpoint for creating and publishing a brand new campaign.
    Triggered when the user submits their budget, URL, and objective on the frontend.
    """
    initial_state = OrchestratorState(
        client_goal=goal,
        plan=CampaignPlan(),
        brand_context="",
        competitor_data="",
        compliance_status="pending",
        ad_status="pending",
        actions_taken=[],
        client_report="",
        current_step="init",
        errors=[],
        messages=["Starting Campaign Creation Workflow..."],
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
        # Run the creation workflow (Research -> Execution)
        final_state = creation_workflow.invoke(initial_state)
        return final_state
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Creation Workflow failed: {str(e)}")


@router.post("/optimize-campaign", response_model=OrchestratorState)
async def optimize_campaign(plan: CampaignPlan):
    """
    Endpoint for optimizing an already live campaign.
    Triggered by a cron job in the NestJS backend (e.g. daily/hourly).
    """
    # In a real scenario, NestJS would send the existing goal and state data as well.
    # For now, we'll initialize a dummy goal for the state shape.
    dummy_goal = CampaignGoal(
        objective="Existing Campaign Optimization",
        budget=1000,
        industry="Unknown",
        target_audience="Unknown",
        target_country="IN"
    )
    
    initial_state = OrchestratorState(
        client_goal=dummy_goal,
        plan=plan,
        brand_context="",
        competitor_data="",
        compliance_status="approved", # Already live
        ad_status="pending",
        actions_taken=[],
        client_report="",
        current_step="init",
        errors=[],
        messages=["Starting Campaign Optimization Workflow..."],
        execution_results={}, # Should be populated with live campaign IDs
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
        # Run the optimization workflow (Ad Status -> Growth Agents)
        final_state = optimization_workflow.invoke(initial_state)
        return final_state
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization Workflow failed: {str(e)}")
