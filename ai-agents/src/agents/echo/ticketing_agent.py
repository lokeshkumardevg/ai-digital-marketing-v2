"""
Echo Ticketing Agent (echo_ticketing)
Auto-creates support tickets for negative feedback, assigns to manager, and sets SLA deadlines.
"""

import json
from datetime import datetime, timedelta
from ..base import AgentResult, get_llm, clean_json_markdown

NEGATIVE_KEYWORDS = ["terrible", "worst", "never again", "disgusting", "rude", "scam", "fraud"]


def _keyword_sentiment_score(text: str) -> float:
    """Simple keyword-based sentiment score (0-1)."""
    negative_kw = ["bad", "terrible", "worst", "rude", "awful", "poor", "slow", "dirty", "painful", "disappointed",
                   "never again", "disgusting", "scam", "fraud", "horrible", "unacceptable"]
    positive_kw = ["good", "great", "love", "excellent", "amazing", "happy", "friendly", "wonderful", "best"]
    text_lower = text.lower()
    neg = sum(1 for w in negative_kw if w in text_lower)
    pos = sum(1 for w in positive_kw if w in text_lower)
    total = neg + pos
    return round(pos / total, 2) if total > 0 else 0.5


def _should_create_ticket(feedback_item: dict) -> tuple[bool, str]:
    """
    Determine if a support ticket should be created.
    Returns (should_create: bool, reason: str).
    """
    rating = feedback_item.get("rating", 5.0)
    text = feedback_item.get("text", "")
    sentiment_score = _keyword_sentiment_score(text)
    text_lower = text.lower()

    if rating is not None and float(rating) <= 2.0:
        return True, f"Low rating ({rating})"
    if sentiment_score < 0.3:
        return True, f"Negative sentiment score ({sentiment_score})"
    if any(kw in text_lower for kw in NEGATIVE_KEYWORDS):
        return True, "Negative keyword detected"
    return False, ""


async def run_ticketing_agent(
    feedback_item: dict,
    location_manager: dict,
    sla_hours: int = 24,
    org_id: str = "",
) -> AgentResult:
    """
    Evaluate feedback and auto-create a support ticket if negative thresholds are met.

    Args:
        feedback_item: {source, text, rating, customer_name, customer_phone, date}
        location_manager: {name, email, phone, role}
        sla_hours: Hours until SLA deadline from now.
        org_id: Organisation identifier.

    Returns:
        AgentResult with ticket details or no-action confirmation.
    """
    try:
        should_create, trigger_reason = _should_create_ticket(feedback_item)

        if not should_create:
            return AgentResult(
                agent_id="echo_ticketing",
                coworker="echo",
                status="success",
                summary="Feedback reviewed — no ticket required. Rating and sentiment are acceptable.",
                proposed_action={"actionType": "no_action_required"},
                data={"trigger_reason": "none", "feedback_rating": feedback_item.get("rating")},
                insights=["Feedback did not meet negative threshold for ticket creation."],
                confidence_score=0.97,
            )

        sla_deadline = (datetime.utcnow() + timedelta(hours=sla_hours)).isoformat()
        llm = get_llm(model="gpt-4o-mini", temperature=0.3, max_tokens=900)

        if llm:
            prompt = (
                f"Analyse this negative customer feedback and create a support ticket.\n\n"
                f"Feedback: {json.dumps(feedback_item)}\n"
                f"Manager: {location_manager.get('name')} ({location_manager.get('role')})\n"
                f"SLA Deadline: {sla_deadline}\n\n"
                "Provide ONLY valid JSON:\n"
                '{"ticket_title": "...", "priority": "<urgent|high|medium>", "root_cause": "...", '
                '"resolution_steps": ["...", "...", "..."], '
                '"manager_alert": "...", "customer_ack": "..."}'
                "\n\nPriority rules: urgent if rating≤1 or threatening language; high if rating≤2; medium otherwise."
                "\nmanager_alert max 200 chars (SMS/WhatsApp). customer_ack max 150 chars."
            )
            result = await llm.ainvoke(prompt)
            ticket_data = json.loads(clean_json_markdown(result.content))
        else:
            ticket_data = {
                "ticket_title": "Rude receptionist complaint — Google Review",
                "priority": "high",
                "root_cause": "Customer experienced dismissive behaviour from front-desk staff during check-in, likely due to high patient volume and inadequate training.",
                "resolution_steps": [
                    "Contact customer within 2 hours with a personal apology call.",
                    "Review CCTV footage of the incident and speak with the receptionist.",
                    "Offer a complimentary service or discount on next visit.",
                    "Schedule a front-desk customer-service refresher training.",
                ],
                "manager_alert": "⚠️ 1-star review: 'Rude receptionist' from Ravi Mehta. Please call within 2h. Ticket #TKT-001.",
                "customer_ack": "Hi Ravi, we're sorry about your experience. Our manager will call you shortly. We take this seriously. 🙏",
            }

        ticket = {
            **ticket_data,
            "ticket_id": f"TKT-{int(datetime.utcnow().timestamp())}",
            "feedback_source": feedback_item.get("source"),
            "customer_name": feedback_item.get("customer_name"),
            "customer_phone": feedback_item.get("customer_phone"),
            "original_feedback": feedback_item.get("text"),
            "rating": feedback_item.get("rating"),
            "assigned_to": location_manager.get("email"),
            "sla_deadline": sla_deadline,
            "trigger_reason": trigger_reason,
            "status": "open",
            "created_at": datetime.utcnow().isoformat(),
        }

        return AgentResult(
            agent_id="echo_ticketing",
            coworker="echo",
            status="success",
            summary=f"Ticket created: '{ticket_data.get('ticket_title')}' — Priority: {ticket_data.get('priority')}. Assigned to {location_manager.get('name')}.",
            proposed_action={
                "actionType": "create_support_ticket",
                "payload": {
                    "ticket": ticket,
                    "manager_alert": ticket_data.get("manager_alert"),
                    "customer_ack": ticket_data.get("customer_ack"),
                    "sla_deadline": sla_deadline,
                },
            },
            data=ticket,
            insights=[
                f"Ticket triggered by: {trigger_reason}.",
                f"Priority '{ticket_data.get('priority')}' — SLA deadline in {sla_hours}h.",
                "Customer acknowledgement message ready to send immediately.",
            ],
            confidence_score=0.92,
        )

    except Exception as exc:
        return AgentResult(
            agent_id="echo_ticketing",
            coworker="echo",
            status="failed",
            summary=f"Ticketing agent failed: {exc}",
            data={"error": str(exc)},
        )
