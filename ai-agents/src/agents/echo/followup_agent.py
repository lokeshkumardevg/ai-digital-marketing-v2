"""
Echo Follow-Up Agent (echo_followup)
Post-resolution satisfaction check, 'still unhappy' signal detection, and gentle review-update suggestion.
"""

import json
from ..base import AgentResult, get_llm, clean_json_markdown

STILL_UNHAPPY_SIGNALS = ["still", "not fixed", "same problem", "disappointed", "didn't help", "worse"]


def _detect_still_unhappy(reply_text: str) -> bool:
    """Return True if reply contains signals of continued dissatisfaction."""
    reply_lower = reply_text.lower()
    return any(signal in reply_lower for signal in STILL_UNHAPPY_SIGNALS)


async def run_followup_agent(
    ticket: dict,
    customer_contact: dict,
    resolution_summary: str,
    days_since_resolution: int = 1,
    incoming_reply: str = "",
    org_id: str = "",
) -> AgentResult:
    """
    Send post-resolution follow-up or parse a customer's reply to determine next action.

    Args:
        ticket: {id, title, priority, original_complaint, resolution_notes, resolved_by}
        customer_contact: {name, phone, preferred_channel}
        resolution_summary: Human-written description of what was done to resolve the issue.
        days_since_resolution: How many days ago the ticket was resolved.
        incoming_reply: Optional — customer's reply to the follow-up message.
        org_id: Organisation identifier.

    Returns:
        AgentResult with follow-up message or re-open/close decision.
    """
    try:
        customer_name = customer_contact.get("name", "Valued Customer")
        reopen_ticket = False
        llm = get_llm(model="gpt-4o-mini", temperature=0.55, max_tokens=700)

        # MODE 2: Parse incoming reply
        if incoming_reply:
            reopen_ticket = _detect_still_unhappy(incoming_reply)

            if llm:
                prompt = (
                    f"A customer replied to a post-resolution follow-up. Analyse their reply and decide the next step.\n\n"
                    f"Customer: {customer_name}\n"
                    f"Original complaint: {ticket.get('original_complaint')}\n"
                    f"Reply: \"{incoming_reply}\"\n\n"
                    "Respond ONLY with valid JSON:\n"
                    '{"satisfied": <true|false>, "sentiment": "<positive|neutral|negative>", '
                    '"next_step_message": "...", "reopen_reason": "..."}'
                )
                result = await llm.ainvoke(prompt)
                parsed = json.loads(clean_json_markdown(result.content))
            else:
                parsed = {
                    "satisfied": not reopen_ticket,
                    "sentiment": "negative" if reopen_ticket else "positive",
                    "next_step_message": (
                        "We're sorry the issue persists. A senior team member will contact you within 2 hours. 🙏"
                        if reopen_ticket else
                        f"Wonderful! We're glad everything is sorted, {customer_name}. Thank you for your patience! 😊"
                    ),
                    "reopen_reason": "Customer indicated issue is unresolved." if reopen_ticket else "",
                }

            action_type = "reopen_ticket" if reopen_ticket else "close_ticket_satisfied"
            return AgentResult(
                agent_id="echo_followup",
                coworker="echo",
                status="success",
                summary=f"Reply parsed. Customer {'still unhappy — reopening ticket' if reopen_ticket else 'satisfied — closing ticket'}.",
                proposed_action={
                    "actionType": action_type,
                    "payload": {
                        "ticket_id": ticket.get("id"),
                        "satisfied": parsed.get("satisfied"),
                        "next_step_message": parsed.get("next_step_message"),
                        "reopen_reason": parsed.get("reopen_reason", ""),
                    },
                },
                data={**parsed, "reopen_ticket": reopen_ticket},
                insights=[
                    f"Reply sentiment: {parsed.get('sentiment')}.",
                    "Ticket reopened — escalate to senior staff." if reopen_ticket else "Ticket closed as resolved.",
                ],
                confidence_score=0.91,
            )

        # MODE 1: Compose follow-up message
        if llm:
            prompt = (
                f"Write a warm post-resolution follow-up WhatsApp message for {customer_name}.\n\n"
                f"Original complaint: {ticket.get('original_complaint')}\n"
                f"Resolution: {resolution_summary}\n"
                f"Resolved by: {ticket.get('resolved_by')}\n"
                f"Days since resolution: {days_since_resolution}\n\n"
                "Generate ONLY valid JSON:\n"
                '{"followup_message": "...", "review_update_suggestion": "...", "nps_micro_question": "..."}'
                "\n\nRules:\n"
                "- followup_message: warm, check satisfaction, max 200 chars.\n"
                "- review_update_suggestion: gentle, NEVER pushy — use: 'If your experience has improved, you are welcome to update your review — no pressure at all!'\n"
                "- nps_micro_question: 'Was your issue fully resolved? Reply YES or NO'"
            )
            result = await llm.ainvoke(prompt)
            parsed = json.loads(clean_json_markdown(result.content))
        else:
            parsed = {
                "followup_message": (
                    f"Hi {customer_name}! 👋 We wanted to check in — has your billing issue been fully sorted? "
                    "Your satisfaction means the world to us. 😊"
                ),
                "review_update_suggestion": (
                    "If your experience has improved, you're welcome to update your review — no pressure at all! 🙏"
                ),
                "nps_micro_question": "Was your issue fully resolved? Reply YES or NO",
            }

        full_message = (
            f"{parsed['followup_message']}\n\n"
            f"{parsed['nps_micro_question']}\n\n"
            f"{parsed['review_update_suggestion']}"
        )

        return AgentResult(
            agent_id="echo_followup",
            coworker="echo",
            status="success",
            summary=f"Follow-up message ready for {customer_name} via {customer_contact.get('preferred_channel', 'WhatsApp')}.",
            proposed_action={
                "actionType": "send_resolution_followup",
                "payload": {
                    "phone": customer_contact.get("phone"),
                    "channel": customer_contact.get("preferred_channel", "whatsapp"),
                    "message": full_message,
                    "ticket_id": ticket.get("id"),
                },
            },
            data={**parsed, "full_message": full_message, "days_since_resolution": days_since_resolution},
            insights=[
                f"Follow-up scheduled {days_since_resolution} day(s) after resolution.",
                "Review update suggestion included — phrased non-coercively.",
                "NPS micro-question enables automated reply parsing.",
            ],
            confidence_score=0.94,
        )

    except Exception as exc:
        return AgentResult(
            agent_id="echo_followup",
            coworker="echo",
            status="failed",
            summary=f"Follow-up agent failed: {exc}",
            data={"error": str(exc)},
        )
