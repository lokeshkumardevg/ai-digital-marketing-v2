"""
Atlas Appointments Agent
Agent ID: atlas_appointments
Coworker: Atlas (Operations Coworker)

Parses booking requests, matches to available slots, confirms bookings, or
suggests alternative times when the preferred slot is unavailable.
"""

import json
from ..base import AgentResult, get_llm, clean_json_markdown


async def run_appointments_agent(
    request_text: str,
    service_catalog: list[dict],
    available_slots: list[dict],
    customer_name: str,
    org_id: str = "",
) -> AgentResult:
    """
    Parse a booking request and find the best matching appointment slot.

    Args:
        request_text: Natural-language booking request from the customer.
        service_catalog: List of service dicts with keys: service, duration_minutes, price, description.
        available_slots: List of slot dicts with keys: date, time, duration_minutes, service.
        customer_name: Full name of the customer making the booking.
        org_id: Optional organisation identifier.

    Returns:
        AgentResult with confirmed slot, calendar event details, and confirmation message.
    """
    llm = get_llm(model="gpt-4o-mini", temperature=0.3, max_tokens=1400)

    if llm is None:
        return AgentResult(
            agent_id="atlas_appointments",
            coworker="atlas",
            status="success",
            summary=f"Appointment booked for {customer_name} — teeth cleaning on 2026-10-29 at 09:00. Mock mode.",
            proposed_action={
                "actionType": "confirm_appointment",
                "payload": {
                    "service": "Teeth Cleaning",
                    "slot": {"date": "2026-10-29", "time": "09:00", "duration_minutes": 45, "service": "Teeth Cleaning"},
                    "confirmation_message": (
                        f"Hi {customer_name}! Your teeth cleaning appointment is confirmed for "
                        "Tuesday, October 29th at 9:00 AM. We look forward to seeing you! "
                        "Please arrive 10 minutes early to complete any paperwork."
                    ),
                    "calendar_event": {
                        "title": f"Teeth Cleaning — {customer_name}",
                        "start": "2026-10-29T09:00:00",
                        "end": "2026-10-29T09:45:00",
                        "description": "Routine teeth cleaning appointment at SmileCare Dental.",
                    },
                    "alternatives": [
                        {"date": "2026-10-29", "time": "14:00", "service": "Teeth Cleaning"},
                        {"date": "2026-10-30", "time": "10:30", "service": "Teeth Cleaning"},
                    ],
                },
            },
            data={
                "matched_service": "Teeth Cleaning",
                "preferred_datetime": "Tuesday morning",
                "best_slot": {"date": "2026-10-29", "time": "09:00", "duration_minutes": 45},
                "match_confidence": 0.95,
            },
            insights=[
                "Service matched: Teeth Cleaning",
                "Slot confirmed: 2026-10-29 09:00",
                "Two alternatives pre-computed in case of change.",
            ],
            confidence_score=0.95,
        )

    try:
        prompt = f"""Parse this appointment request and find the best slot.

Customer name: {customer_name}
Request: {request_text}
Available services: {json.dumps(service_catalog)}
Open slots: {json.dumps(available_slots)}

Respond with a JSON object:
{{
  "matched_service": "exact service name from catalog",
  "preferred_datetime": "date/time the customer mentioned",
  "best_slot": {{date, time, duration_minutes, service}},
  "confirmation_message": "Warm, professional confirmation message to send the customer",
  "calendar_event": {{
    "title": "...",
    "start": "ISO8601 datetime",
    "end": "ISO8601 datetime",
    "description": "..."
  }},
  "alternatives": [
    {{date, time, service}},
    {{date, time, service}}
  ],
  "match_confidence": 0.0-1.0,
  "summary": "one-sentence booking summary"
}}
Return only valid JSON."""

        response = await llm.ainvoke(prompt)
        parsed = json.loads(clean_json_markdown(response.content))

        return AgentResult(
            agent_id="atlas_appointments",
            coworker="atlas",
            status="success",
            summary=parsed.get("summary", f"Appointment scheduled for {customer_name}."),
            proposed_action={
                "actionType": "confirm_appointment",
                "payload": {
                    "service": parsed.get("matched_service"),
                    "slot": parsed.get("best_slot"),
                    "confirmation_message": parsed.get("confirmation_message"),
                    "calendar_event": parsed.get("calendar_event"),
                    "alternatives": parsed.get("alternatives", []),
                },
            },
            data=parsed,
            insights=[
                f"Service matched: {parsed.get('matched_service')}",
                f"Slot confirmed: {parsed.get('best_slot', {}).get('date')} {parsed.get('best_slot', {}).get('time')}",
                f"Match confidence: {parsed.get('match_confidence', 0.9)}",
            ],
            confidence_score=float(parsed.get("match_confidence", 0.9)),
        )

    except Exception as exc:
        return AgentResult(
            agent_id="atlas_appointments",
            coworker="atlas",
            status="failed",
            summary=f"Appointments agent error: {exc}",
            data={"error": str(exc)},
        )
