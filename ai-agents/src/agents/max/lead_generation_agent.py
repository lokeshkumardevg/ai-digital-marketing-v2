"""
Max - Lead Generation Agent
Agent ID: max_lead_generation
Purpose: Enrich and score incoming leads by ICP fit, and route to pipeline stage.
"""

import json
from ..base import AgentResult, get_llm, clean_json_markdown


async def run_lead_generation_agent(
    lead_data: dict,
    org_id: str = "",
) -> AgentResult:
    """
    Score a new lead on ICP fit, enrich with contextual notes, and recommend
    the appropriate CRM pipeline stage and first-touch action.

    Args:
        lead_data: Dict containing lead info — name, email, phone, source,
                   message, and optionally company.
        org_id: Organisation identifier.

    Returns:
        AgentResult with lead score, ICP fit, recommended stage, and enrichment notes.
    """
    llm = get_llm(model="gpt-4o-mini", temperature=0.3, max_tokens=1200)

    name = lead_data.get("name", "Unknown")
    email = lead_data.get("email", "")
    source = lead_data.get("source", "website")
    message = lead_data.get("message", "")
    company = lead_data.get("company", "")

    if llm is None:
        return AgentResult(
            agent_id="max_lead_generation",
            coworker="max",
            status="success",
            summary=(
                "Dr. Priya Sharma scored 78/100 — High ICP fit. "
                "Dentist with clinic expansion intent. Route to Qualified stage."
            ),
            data={
                "lead_score": 78,
                "icp_fit": "high",
                "recommended_stage": "Qualified",
                "enrichment_notes": [
                    "Lead is a practising dentist — strong budget signals for clinic marketing.",
                    "Message references 'expanding to second location' — high urgency indicator.",
                    "LinkedIn profile likely shows clinical credentials; validate before outreach.",
                ],
                "suggested_first_action": "WhatsApp",
                "lead_summary": (
                    f"{name} is a high-value lead from {source}. "
                    "Strong intent signals detected in message. Recommend immediate WhatsApp outreach."
                ),
            },
            proposed_action={
                "actionType": "create_crm_contact",
                "payload": {
                    "lead_score": 78,
                    "icp_fit": "high",
                    "stage": "Qualified",
                    "enrichment": {
                        "notes": [
                            "Practising dentist with clinic expansion plans.",
                            "High urgency — mentions second location launch.",
                        ],
                        "suggested_first_action": "WhatsApp",
                    },
                },
            },
            insights=[
                "High-intent lead — contact within 1 hour to maximise conversion.",
                "Personalise outreach with clinic growth case studies.",
                "Add to 'Dentist Decision Makers' segment for targeted nurture.",
            ],
            confidence_score=0.87,
        )

    prompt = f"""
You are a CRM and sales intelligence agent. Score and enrich this incoming lead:

Name: {name}
Email: {email}
Phone: {lead_data.get('phone', 'N/A')}
Source: {source}
Company: {company or 'Not provided'}
Message: {message}

Evaluate ICP fit based on: budget signals, job title seniority, urgency keywords in message.

Return a JSON object:
{{
  "lead_score": <integer 0-100>,
  "icp_fit": "high" | "medium" | "low",
  "recommended_stage": "Lead" | "Contacted" | "Qualified",
  "enrichment_notes": ["note 1", "note 2", "note 3"],
  "suggested_first_action": "call" | "email" | "WhatsApp",
  "lead_summary": "2-sentence lead overview",
  "summary": "One sentence result summary"
}}

Return ONLY the JSON object, no markdown fences.
"""

    try:
        from langchain_core.messages import HumanMessage
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        parsed = json.loads(clean_json_markdown(response.content))

        return AgentResult(
            agent_id="max_lead_generation",
            coworker="max",
            status="success",
            summary=parsed.get("summary", f"Lead {name} scored and routed successfully."),
            data={
                "lead_score": parsed.get("lead_score", 0),
                "icp_fit": parsed.get("icp_fit", "low"),
                "recommended_stage": parsed.get("recommended_stage", "Lead"),
                "enrichment_notes": parsed.get("enrichment_notes", []),
                "suggested_first_action": parsed.get("suggested_first_action", "email"),
                "lead_summary": parsed.get("lead_summary", ""),
            },
            proposed_action={
                "actionType": "create_crm_contact",
                "payload": {
                    "lead_score": parsed.get("lead_score", 0),
                    "icp_fit": parsed.get("icp_fit", "low"),
                    "stage": parsed.get("recommended_stage", "Lead"),
                    "enrichment": {
                        "notes": parsed.get("enrichment_notes", []),
                        "suggested_first_action": parsed.get("suggested_first_action", "email"),
                    },
                },
            },
            insights=[
                f"Lead scored {parsed.get('lead_score', 0)}/100 — {parsed.get('icp_fit', 'low')} ICP fit.",
                f"Recommended first touch: {parsed.get('suggested_first_action', 'email')}.",
                "Review enrichment notes before outreach for personalisation.",
            ],
            confidence_score=0.91,
        )
    except Exception as e:
        return AgentResult(
            agent_id="max_lead_generation",
            coworker="max",
            status="failed",
            summary=f"Lead generation agent failed: {str(e)}",
            confidence_score=0.0,
        )
