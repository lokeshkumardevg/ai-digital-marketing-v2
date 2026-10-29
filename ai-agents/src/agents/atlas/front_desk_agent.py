"""
Atlas Front Desk Agent
Agent ID: atlas_front_desk
Coworker: Atlas (Operations Coworker)

Handles incoming calls/chats — understands customer intent, answers from
business knowledge base, and routes to appropriate next step.
"""

import json
from typing import Any
from ..base import AgentResult, get_llm, clean_json_markdown


def _detect_intent(text: str) -> tuple[str, bool]:
    """Pre-check intent detection for speed before LLM call."""
    lower = text.lower()
    escalate = False

    if any(kw in lower for kw in ["appointment", "book", "schedule", "visit"]):
        return "booking", False
    if any(kw in lower for kw in ["direction", "address", "where", "location", "parking"]):
        return "directions", False
    if any(kw in lower for kw in ["emergency", "pain", "urgent", "bleeding"]):
        return "emergency", True
    if any(kw in lower for kw in ["complaint", "unhappy", "wrong", "refund"]):
        return "complaint", True
    if any(kw in lower for kw in ["price", "cost", "how much"]):
        return "pricing", False
    return "general_inquiry", False


async def run_front_desk_agent(
    transcript_or_message: str,
    business_hours: dict,
    service_catalog: list[dict],
    business_name: str,
    org_id: str = "",
) -> AgentResult:
    """
    Handle incoming customer calls or chats.

    Detects intent via Python heuristics, then uses LLM to generate a natural
    response and routing decision.

    Args:
        transcript_or_message: Raw call transcript or chat message from the customer.
        business_hours: Dict mapping day abbreviations to hour strings, e.g. {mon: "9am-6pm"}.
        service_catalog: List of service dicts with keys: service, duration_minutes, price, description.
        business_name: Display name of the business.
        org_id: Optional organisation identifier for multi-tenant use.

    Returns:
        AgentResult with routing decision, customer response, and proposed action.
    """
    intent, escalate = _detect_intent(transcript_or_message)

    llm = get_llm(model="gpt-4o-mini", temperature=0.4, max_tokens=1200)

    if llm is None:
        # Realistic mock fallback
        return AgentResult(
            agent_id="atlas_front_desk",
            coworker="atlas",
            status="escalated" if escalate else "success",
            summary=f"Front desk handled '{intent}' inquiry for {business_name}. Mock mode (no API key).",
            proposed_action={
                "actionType": "route_to_booking" if intent == "booking" else "escalate_to_human" if escalate else "answer_query",
                "payload": {
                    "intent": intent,
                    "routing_decision": "emergency_protocol" if escalate and intent == "emergency" else "book_appointment" if intent == "booking" else "escalate_human" if escalate else "self_serve",
                    "escalate": escalate,
                },
            },
            data={
                "intent": intent,
                "escalate": escalate,
                "customer_response": (
                    "I understand you're experiencing tooth pain — that sounds urgent! "
                    "Let me get you connected with our team right away for a same-day emergency appointment. "
                    "Our office is open today until 6 PM. Can I get your name and a callback number?"
                ),
                "routing_decision": "book_appointment",
                "booking_service": "Emergency Dental Exam",
                "booking_time_requested": "same-day",
                "emergency_protocol_message": "Patient reports acute dental pain. Triage immediately upon arrival.",
                "confidence": 0.92,
            },
            insights=[
                f"Intent detected: {intent}",
                "Patient flagged for same-day triage.",
                "Escalation recommended due to pain indicator.",
            ],
            confidence_score=0.92,
        )

    try:
        prompt = f"""You are the AI front desk for {business_name}.

Incoming message: {transcript_or_message}
Detected intent: {intent}
Business hours: {json.dumps(business_hours)}
Services offered: {json.dumps(service_catalog)}

Respond with a JSON object containing:
{{
  "customer_response": "Natural, warm response to the customer as if answering their call/chat",
  "routing_decision": "self_serve" | "book_appointment" | "escalate_human" | "emergency_protocol",
  "booking_service": "service name if intent is booking, else null",
  "booking_time_requested": "date/time mentioned by customer, else null",
  "emergency_protocol_message": "brief triage note if emergency, else null",
  "confidence": 0.0-1.0,
  "summary": "one-sentence summary of this interaction"
}}
Return only valid JSON."""

        response = await llm.ainvoke(prompt)
        parsed = json.loads(clean_json_markdown(response.content))

        routing = parsed.get("routing_decision", "self_serve")
        action_type = (
            "route_to_booking" if routing == "book_appointment"
            else "escalate_to_human" if routing in ("escalate_human", "emergency_protocol")
            else "answer_query"
        )

        return AgentResult(
            agent_id="atlas_front_desk",
            coworker="atlas",
            status="escalated" if escalate else "success",
            summary=parsed.get("summary", f"Front desk handled {intent} inquiry."),
            proposed_action={
                "actionType": action_type,
                "payload": {"intent": intent, "routing_decision": routing, "escalate": escalate},
            },
            data=parsed,
            insights=[
                f"Intent detected: {intent}",
                f"Routing decision: {routing}",
                f"Confidence: {parsed.get('confidence', 0.9)}",
            ],
            confidence_score=float(parsed.get("confidence", 0.9)),
        )

    except Exception as exc:
        return AgentResult(
            agent_id="atlas_front_desk",
            coworker="atlas",
            status="failed",
            summary=f"Front desk agent error: {exc}",
            data={"error": str(exc)},
        )
