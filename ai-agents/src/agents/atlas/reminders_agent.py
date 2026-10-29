"""
Atlas Reminders Agent
Agent ID: atlas_reminders
Coworker: Atlas (Operations Coworker)

Generates appointment reminder messages for WhatsApp/SMS/email and parses
customer replies to detect confirm/reschedule/cancel intent.
"""

import json
from ..base import AgentResult, get_llm, clean_json_markdown


async def run_reminders_agent(
    appointment_record: dict,
    customer_contact: dict,
    reminder_type: str = "24h",
    incoming_reply: str = "",
    org_id: str = "",
) -> AgentResult:
    """
    Generate appointment reminders or parse reply intents.

    Operates in two modes:
      - "24h" / "2h": Generate a reminder message tailored to the channel.
      - "parse_reply": Analyse the customer's reply and determine next action.

    Args:
        appointment_record: Dict with keys: service, date, time, duration_minutes, doctor_name, address.
        customer_contact: Dict with keys: name, phone, preferred_channel ("whatsapp"|"sms"|"email").
        reminder_type: One of "24h", "2h", or "parse_reply".
        incoming_reply: The customer's reply text (only used when reminder_type="parse_reply").
        org_id: Optional organisation identifier.

    Returns:
        AgentResult with the reminder message or parsed reply intent and follow-up action.
    """
    llm = get_llm(model="gpt-4o-mini", temperature=0.4, max_tokens=800)
    customer_name = customer_contact.get("name", "Patient")
    channel = customer_contact.get("preferred_channel", "whatsapp")
    parse_mode = reminder_type == "parse_reply"

    if llm is None:
        if parse_mode:
            return AgentResult(
                agent_id="atlas_reminders",
                coworker="atlas",
                status="success",
                summary=f"Reply from {customer_name} parsed as 'confirm'. Mock mode.",
                proposed_action={
                    "actionType": "update_appointment_status",
                    "payload": {"status": "confirmed", "follow_up": "Send confirmation receipt to patient."},
                },
                data={
                    "parsed_intent": "confirm",
                    "new_time_requested": None,
                    "follow_up_response": f"Great, {customer_name}! We'll see you at your scheduled time. See you then! 😊",
                },
                insights=["Reply intent: confirm", "No reschedule needed."],
                confidence_score=0.93,
            )
        # Generate reminder mock
        service = appointment_record.get("service", "your appointment")
        date = appointment_record.get("date", "tomorrow")
        time = appointment_record.get("time", "10:00 AM")
        doctor = appointment_record.get("doctor_name", "our team")
        reminder_msg = (
            f"Hi {customer_name}! 👋 Reminder: Your *{service}* is scheduled for "
            f"*{date} at {time}* with {doctor}. Reply *YES* to confirm, *RESCHEDULE* to change, "
            f"or *CANCEL* to cancel. See you soon! 🦷"
        )
        return AgentResult(
            agent_id="atlas_reminders",
            coworker="atlas",
            status="success",
            summary=f"{reminder_type} reminder generated for {customer_name} via {channel}. Mock mode.",
            proposed_action={
                "actionType": "send_reminder",
                "payload": {"channel": channel, "message": reminder_msg, "phone": customer_contact.get("phone")},
            },
            data={"reminder_message": reminder_msg, "channel": channel, "reminder_type": reminder_type},
            insights=[
                f"Reminder type: {reminder_type}",
                f"Channel: {channel}",
                "Confirm/Reschedule/Cancel CTAs included.",
            ],
            confidence_score=0.96,
        )

    try:
        if parse_mode:
            prompt = f"""Parse this reply to an appointment reminder: "{incoming_reply}"

Patient name: {customer_contact.get('name')}
Original appointment: {json.dumps(appointment_record)}

Respond with JSON:
{{
  "parsed_intent": "confirm" | "reschedule" | "cancel" | "question" | "unclear",
  "new_time_requested": "if reschedule — the new time they want, else null",
  "follow_up_response": "Appropriate short reply to send back to the patient",
  "summary": "one-sentence summary"
}}
Return only valid JSON."""
        else:
            prompt = f"""Write a {reminder_type} appointment reminder for {customer_contact.get('name')}.
Appointment: {appointment_record.get('service')} on {appointment_record.get('date')} at {appointment_record.get('time')} with {appointment_record.get('doctor_name')} at {appointment_record.get('address')}.
Channel: {channel} (match appropriate length and tone for this channel).
Include confirm/reschedule/cancel options. Be warm and professional.

Respond with JSON:
{{
  "reminder_message": "The full message text to send",
  "channel": "{channel}",
  "reminder_type": "{reminder_type}",
  "summary": "one-sentence summary"
}}
Return only valid JSON."""

        response = await llm.ainvoke(prompt)
        parsed = json.loads(clean_json_markdown(response.content))

        if parse_mode:
            intent = parsed.get("parsed_intent", "unclear")
            action_type = (
                "update_appointment_status" if intent in ("confirm", "cancel")
                else "trigger_reschedule_flow" if intent == "reschedule"
                else "escalate_to_human"
            )
            return AgentResult(
                agent_id="atlas_reminders",
                coworker="atlas",
                status="success",
                summary=parsed.get("summary", f"Reply parsed: {intent}"),
                proposed_action={
                    "actionType": action_type,
                    "payload": {"status": intent, "new_time_requested": parsed.get("new_time_requested")},
                },
                data=parsed,
                insights=[f"Reply intent: {intent}", f"Follow-up: {parsed.get('follow_up_response', '')}"],
                confidence_score=0.91,
            )

        return AgentResult(
            agent_id="atlas_reminders",
            coworker="atlas",
            status="success",
            summary=parsed.get("summary", f"{reminder_type} reminder generated."),
            proposed_action={
                "actionType": "send_reminder",
                "payload": {
                    "channel": channel,
                    "message": parsed.get("reminder_message"),
                    "phone": customer_contact.get("phone"),
                },
            },
            data=parsed,
            insights=[f"Reminder type: {reminder_type}", f"Channel: {channel}"],
            confidence_score=0.94,
        )

    except Exception as exc:
        return AgentResult(
            agent_id="atlas_reminders",
            coworker="atlas",
            status="failed",
            summary=f"Reminders agent error: {exc}",
            data={"error": str(exc)},
        )
