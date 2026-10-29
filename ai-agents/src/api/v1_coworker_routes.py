"""
V1 Coworker Agent Routes for Wheedle.ai
Exposes REST endpoints for all 27 governed agents across the 4 AI Coworkers (Max, Stella, Atlas, Echo).
"""
import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel, Field

from src.agents.base import AgentResult

# Max agents
from src.agents.max import (
    run_ads_campaign_agent,
    run_deep_research_agent,
    run_lead_generation_agent,
    run_contact_segmentation_agent,
    run_ai_visibility_agent,
    run_template_design_agent,
    run_marketing_automation_agent,
)

# Stella agents
from src.agents.stella import (
    run_review_generation_agent,
    run_review_response_agent,
    run_listings_optimization_agent,
    run_local_pages_agent,
    run_social_publishing_agent,
    run_social_engagement_agent,
    run_chatbot_agent,
)

# Atlas agents
from src.agents.atlas import (
    run_front_desk_agent,
    run_appointments_agent,
    run_reminders_agent,
    run_waitlist_recall_agent,
    run_lead_followup_agent,
    run_multimodal_voice_agent,
    run_insurance_verification_agent,
)

# Echo agents
from src.agents.echo import (
    run_survey_agent,
    run_sentiment_insights_agent,
    run_ticketing_agent,
    run_followup_agent,
    run_competitor_analysis_agent,
    run_reporting_agent,
    run_platform_policy_watchdog_agent,
)

logger = logging.getLogger(__name__)
coworker_router = APIRouter(tags=["AI Coworkers"])


# ─────────────────────────────────────────────────────────────
# UNIVERSAL AGENT EXECUTION ENDPOINT
# ─────────────────────────────────────────────────────────────

class UniversalAgentRequest(BaseModel):
    coworker: str = Field(..., description="Coworker name: 'max', 'stella', 'atlas', 'echo'")
    agent_id: str = Field(..., description="Agent ID (e.g. 'ads_campaign', 'review_response')")
    org_id: Optional[str] = ""
    inputs: Dict[str, Any] = Field(default_factory=dict, description="Inputs tailored to the agent")


@coworker_router.post("/agents/execute", response_model=AgentResult)
async def execute_agent(req: UniversalAgentRequest):
    """
    Universal orchestrator dispatch endpoint to invoke any of the 27 agents dynamically.
    """
    coworker = req.coworker.lower()
    agent_id = req.agent_id.lower().replace(f"{coworker}_", "")
    inp = req.inputs
    org_id = req.org_id or ""

    try:
        # MAX AGENTS
        if coworker == "max":
            if agent_id == "ads_campaign":
                return await run_ads_campaign_agent(
                    brand_name=inp.get("brand_name", "Brand"),
                    industry=inp.get("industry", "Business"),
                    budget=float(inp.get("budget", 1000)),
                    objective=inp.get("objective", "conversions"),
                    platforms=inp.get("platforms", ["google", "meta"]),
                    org_id=org_id
                )
            elif agent_id == "deep_research":
                return await run_deep_research_agent(
                    brand_name=inp.get("brand_name", "Brand"),
                    website_url=inp.get("website_url", ""),
                    competitors=inp.get("competitors", []),
                    industry=inp.get("industry", "Business"),
                    org_id=org_id
                )
            elif agent_id == "lead_generation":
                return await run_lead_generation_agent(lead_data=inp.get("lead_data", inp), org_id=org_id)
            elif agent_id == "contact_segmentation":
                return await run_contact_segmentation_agent(contacts_list=inp.get("contacts_list", []), org_id=org_id)
            elif agent_id == "ai_visibility":
                return await run_ai_visibility_agent(
                    brand_name=inp.get("brand_name", "Brand"),
                    target_prompts=inp.get("target_prompts", []),
                    location=inp.get("location", ""),
                    industry=inp.get("industry", ""),
                    org_id=org_id
                )
            elif agent_id == "template_design":
                return await run_template_design_agent(
                    brand_profile=inp.get("brand_profile", {}),
                    template_type=inp.get("template_type", "email"),
                    brief=inp.get("brief", ""),
                    org_id=org_id
                )
            elif agent_id == "marketing_automation":
                return await run_marketing_automation_agent(
                    workflow_definition=inp.get("workflow_definition", {}),
                    trigger_payload=inp.get("trigger_payload", {}),
                    org_id=org_id
                )

        # STELLA AGENTS
        elif coworker == "stella":
            if agent_id == "review_generation":
                return await run_review_generation_agent(
                    customer_name=inp.get("customer_name", "Valued Customer"),
                    customer_phone=inp.get("customer_phone", ""),
                    service_completed=inp.get("service_completed", "General Service"),
                    google_review_link=inp.get("google_review_link", "https://g.page/review"),
                    channel=inp.get("channel", "whatsapp"),
                    org_id=org_id
                )
            elif agent_id == "review_response":
                return await run_review_response_agent(
                    review_text=inp.get("review_text", inp.get("content", "Good service")),
                    star_rating=int(inp.get("star_rating", inp.get("rating", 5))),
                    reviewer_name=inp.get("reviewer_name", "Customer"),
                    brand_voice=inp.get("brand_voice", "professional"),
                    platform=inp.get("platform", "google"),
                    org_id=org_id
                )
            elif agent_id == "listings_optimization":
                return await run_listings_optimization_agent(location_data=inp.get("location_data", inp), org_id=org_id)
            elif agent_id == "local_pages":
                return await run_local_pages_agent(
                    location=inp.get("location", "City Center"),
                    service=inp.get("service", "Consulting"),
                    local_keywords=inp.get("local_keywords", []),
                    brand_voice=inp.get("brand_voice", "professional"),
                    brand_name=inp.get("brand_name", "Business"),
                    org_id=org_id
                )
            elif agent_id == "social_publishing":
                return await run_social_publishing_agent(
                    topic=inp.get("topic", "Latest Updates"),
                    brand_tone=inp.get("brand_tone", "professional"),
                    platforms=inp.get("platforms", ["linkedin", "instagram"]),
                    target_audience=inp.get("target_audience", "prospective customers"),
                    brand_name=inp.get("brand_name", "Company"),
                    org_id=org_id
                )
            elif agent_id == "social_engagement":
                return await run_social_engagement_agent(
                    comment_text=inp.get("comment_text", inp.get("user_comment", "")),
                    post_context=inp.get("post_context", ""),
                    brand_tone=inp.get("brand_tone", "professional"),
                    commenter_name=inp.get("commenter_name", "User"),
                    platform=inp.get("platform", "instagram"),
                    org_id=org_id
                )
            elif agent_id == "chatbot":
                return await run_chatbot_agent(
                    user_message=inp.get("user_message", inp.get("message", "Hello")),
                    conversation_history=inp.get("conversation_history", []),
                    knowledge_base=inp.get("knowledge_base", []),
                    brand_name=inp.get("brand_name", "Wheedle"),
                    org_id=org_id
                )

        # ATLAS AGENTS
        elif coworker == "atlas":
            if agent_id == "front_desk":
                return await run_front_desk_agent(
                    transcript_or_message=inp.get("transcript_or_message", inp.get("message", "")),
                    business_hours=inp.get("business_hours", {}),
                    service_catalog=inp.get("service_catalog", []),
                    business_name=inp.get("business_name", "Our Clinic"),
                    org_id=org_id
                )
            elif agent_id == "appointments":
                return await run_appointments_agent(
                    request_text=inp.get("request_text", ""),
                    service_catalog=inp.get("service_catalog", []),
                    available_slots=inp.get("available_slots", []),
                    customer_name=inp.get("customer_name", "Patient"),
                    org_id=org_id
                )
            elif agent_id == "reminders":
                return await run_reminders_agent(
                    appointment_record=inp.get("appointment_record", {}),
                    customer_contact=inp.get("customer_contact", {}),
                    reminder_type=inp.get("reminder_type", "24h"),
                    incoming_reply=inp.get("incoming_reply", ""),
                    org_id=org_id
                )
            elif agent_id == "waitlist_recall":
                return await run_waitlist_recall_agent(
                    mode=inp.get("mode", "fill_cancellation"),
                    org_id=org_id,
                    cancelled_slot=inp.get("cancelled_slot"),
                    waitlist=inp.get("waitlist"),
                    inactive_customers=inp.get("inactive_customers")
                )
            elif agent_id == "lead_followup":
                return await run_lead_followup_agent(
                    lead_record=inp.get("lead_record", {}),
                    business_context=inp.get("business_context", {}),
                    org_id=org_id
                )
            elif agent_id == "multimodal_voice":
                return await run_multimodal_voice_agent(
                    transcript=inp.get("transcript", ""),
                    detected_language=inp.get("detected_language", "auto"),
                    intent=inp.get("intent", ""),
                    call_type=inp.get("call_type", "inbound"),
                    org_id=org_id
                )
            elif agent_id == "insurance_verification":
                return await run_insurance_verification_agent(
                    patient_details=inp.get("patient_details", {}),
                    insurance_info=inp.get("insurance_info", {}),
                    requested_service=inp.get("requested_service", "General"),
                    org_id=org_id
                )

        # ECHO AGENTS
        elif coworker == "echo":
            if agent_id == "survey":
                return await run_survey_agent(
                    customer=inp.get("customer", {}),
                    service_type=inp.get("service_type", "Consultation"),
                    mode=inp.get("mode", "compose"),
                    survey_response_text=inp.get("survey_response_text", ""),
                    org_id=org_id
                )
            elif agent_id == "sentiment_insights":
                return await run_sentiment_insights_agent(
                    feedback_items=inp.get("feedback_items", []),
                    org_id=org_id,
                    analysis_period_days=int(inp.get("analysis_period_days", 30))
                )
            elif agent_id == "ticketing":
                return await run_ticketing_agent(
                    feedback_item=inp.get("feedback_item", {}),
                    location_manager=inp.get("location_manager", {"name": "Manager", "email": "admin@example.com"}),
                    sla_hours=int(inp.get("sla_hours", 24)),
                    org_id=org_id
                )
            elif agent_id == "followup":
                return await run_followup_agent(
                    ticket=inp.get("ticket", {}),
                    customer_contact=inp.get("customer_contact", {}),
                    resolution_summary=inp.get("resolution_summary", "Resolved successfully"),
                    days_since_resolution=int(inp.get("days_since_resolution", 1)),
                    org_id=org_id
                )
            elif agent_id == "competitor_analysis":
                return await run_competitor_analysis_agent(
                    competitor_names=inp.get("competitor_names", []),
                    own_location_data=inp.get("own_location_data", {}),
                    industry=inp.get("industry", "Healthcare"),
                    org_id=org_id
                )
            elif agent_id == "reporting":
                return await run_reporting_agent(
                    all_kpis=inp.get("all_kpis", {}),
                    date_range=inp.get("date_range", {}),
                    brand_name=inp.get("brand_name", "Wheedle Client"),
                    report_type=inp.get("report_type", "weekly"),
                    org_id=org_id
                )
            elif agent_id in ["platform_policy_watchdog", "policy_watchdog"]:
                return await run_platform_policy_watchdog_agent(
                    platforms=inp.get("platforms"),
                    industry=inp.get("industry", "Healthcare & Local Services"),
                    active_assets_sample=inp.get("active_assets_sample"),
                    recent_policy_updates=inp.get("recent_policy_updates"),
                    org_id=org_id
                )

        raise HTTPException(
            status_code=404,
            detail=f"Agent '{agent_id}' under coworker '{coworker}' not found."
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error executing agent {agent_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

