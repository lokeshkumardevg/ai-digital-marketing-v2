"""
Atlas Lead Follow-up Agent
Agent ID: atlas_lead_followup
Coworker: Atlas (Operations Coworker)

Speed-to-lead agent — triggers within 2 minutes of lead.created.
Generates personalised outreach (WhatsApp, call script, or email) and a
multi-step follow-up sequence based on lead source.
"""

import json
from ..base import AgentResult, get_llm, clean_json_markdown


def _select_channel(source: str) -> str:
    """Determine the preferred outreach channel from lead source."""
    source_lower = source.lower()
    if source_lower in ("facebook_ad", "instagram", "meta"):
        return "whatsapp"
    if source_lower in ("google_ad", "google_organic", "website"):
        return "call_then_whatsapp"
    if source_lower == "linkedin":
        return "email"
    if source_lower == "chatbot":
        return "whatsapp"
    return "whatsapp"


async def run_lead_followup_agent(
    lead_record: dict,
    business_context: dict,
    org_id: str = "",
) -> AgentResult:
    """
    Generate personalised speed-to-lead outreach within 2 minutes of lead creation.

    Args:
        lead_record: Dict with keys: name, email, phone, source, message,
                     inquiry_type, created_at.
        business_context: Dict with keys: business_name, industry, services,
                          team_contact_name, business_hours.
        org_id: Optional organisation identifier.

    Returns:
        AgentResult with channel selection, WhatsApp message, call script,
        optional email, and a follow-up sequence.
    """
    name = lead_record.get("name", "there")
    source = lead_record.get("source", "website")
    preferred_channel = _select_channel(source)
    business_name = business_context.get("business_name", "our clinic")
    team_contact = business_context.get("team_contact_name", "our team")

    llm = get_llm(model="gpt-4o-mini", temperature=0.5, max_tokens=1400)

    if llm is None:
        return AgentResult(
            agent_id="atlas_lead_followup",
            coworker="atlas",
            status="success",
            summary=f"Lead follow-up generated for {name} (source: {source}) via {preferred_channel}. Mock mode.",
            proposed_action={
                "actionType": "initiate_lead_followup",
                "payload": {
                    "channel": preferred_channel,
                    "whatsapp_message": (
                        f"Hi {name}! 👋 Thanks for your interest in dental implants at {business_name}. "
                        f"I'm {team_contact} — let's find you the best solution. When's a good time to chat? 😊"
                    ),
                    "call_script": (
                        f"Hi, may I speak with {name}? Great! This is {team_contact} from {business_name}. "
                        f"I saw your inquiry about dental implants and wanted to personally reach out. "
                        f"We have some excellent options and I'd love to walk you through them. "
                        f"Do you have 5 minutes right now?"
                    ),
                    "email_subject": None,
                    "email_body": None,
                    "followup_sequence": [
                        {"delay": "2h", "action": "send_whatsapp", "message": f"Hi {name}, just following up on your dental implant inquiry. Happy to answer any questions!"},
                        {"delay": "24h", "action": "call_attempt_2", "message": "Second call attempt if no response."},
                        {"delay": "3d", "action": "send_whatsapp", "message": f"Hi {name}! We have a special consultation offer this week for dental implants. Would you like to learn more?"},
                    ],
                },
            },
            data={
                "lead_name": name,
                "source": source,
                "preferred_channel": preferred_channel,
                "inquiry_type": lead_record.get("inquiry_type"),
                "urgency": "high",
            },
            insights=[
                f"Lead source: {source} → channel: {preferred_channel}",
                "Speed-to-lead window: within 2 minutes of creation.",
                "3-step follow-up sequence scheduled.",
            ],
            confidence_score=0.94,
        )

    try:
        prompt = f"""Generate a personalised lead follow-up for {business_name}.

Lead name: {name}
Lead source: {source}
Inquiry/message: {lead_record.get('message', 'Not specified')}
Inquiry type: {lead_record.get('inquiry_type', 'general')}
Preferred channel: {preferred_channel}
Team contact: {team_contact}
Business hours: {business_context.get('business_hours', 'Mon-Sat 9am-6pm')}

URGENCY: This must feel immediate and personal, not automated.

Respond with JSON:
{{
  "whatsapp_message": "Personalised WhatsApp/SMS message (max 200 chars, warm, reference their inquiry)",
  "call_script": "3-4 sentence call opener the sales rep says when the lead picks up",
  "email_subject": "Email subject line (only if channel is email, else null)",
  "email_body": "First paragraph of email (only if channel is email, else null)",
  "followup_sequence": [
    {{"delay": "2h", "action": "...", "message": "..."}},
    {{"delay": "24h", "action": "...", "message": "..."}},
    {{"delay": "3d", "action": "...", "message": "..."}}
  ],
  "summary": "one-sentence summary"
}}
Return only valid JSON."""

        response = await llm.ainvoke(prompt)
        parsed = json.loads(clean_json_markdown(response.content))

        return AgentResult(
            agent_id="atlas_lead_followup",
            coworker="atlas",
            status="success",
            summary=parsed.get("summary", f"Lead follow-up ready for {name}."),
            proposed_action={
                "actionType": "initiate_lead_followup",
                "payload": {
                    "channel": preferred_channel,
                    "whatsapp_message": parsed.get("whatsapp_message"),
                    "call_script": parsed.get("call_script"),
                    "email_subject": parsed.get("email_subject"),
                    "email_body": parsed.get("email_body"),
                    "followup_sequence": parsed.get("followup_sequence", []),
                },
            },
            data={**parsed, "preferred_channel": preferred_channel, "source": source},
            insights=[
                f"Channel selected: {preferred_channel} (source: {source})",
                "Speed-to-lead: triggered within 2 min of lead.created.",
                f"Follow-up sequence: {len(parsed.get('followup_sequence', []))} steps.",
            ],
            confidence_score=0.93,
        )

    except Exception as exc:
        return AgentResult(
            agent_id="atlas_lead_followup",
            coworker="atlas",
            status="failed",
            summary=f"Lead follow-up agent error: {exc}",
            data={"error": str(exc)},
        )
