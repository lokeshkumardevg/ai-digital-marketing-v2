"""
Atlas Waitlist & Recall Agent
Agent ID: atlas_waitlist_recall
Coworker: Atlas (Operations Coworker)

Handles two scenarios:
  1. fill_cancellation — A slot just opened; notify the best-matched waitlist contacts.
  2. reactivate_lapsed — Re-engage customers who haven't visited in a while.
"""

import json
from ..base import AgentResult, get_llm, clean_json_markdown


async def run_waitlist_recall_agent(
    mode: str,
    org_id: str = "",
    cancelled_slot: dict = None,
    waitlist: list[dict] = None,
    inactive_customers: list[dict] = None,
) -> AgentResult:
    """
    Fill a cancelled appointment slot from the waitlist, or reactivate lapsed customers.

    Args:
        mode: "fill_cancellation" or "reactivate_lapsed".
        org_id: Optional organisation identifier.
        cancelled_slot: Dict with keys: service, date, time, duration_minutes.
                        Required for mode="fill_cancellation".
        waitlist: List of waitlist dicts with keys: name, phone, requested_service,
                  wait_since, priority_score. Required for mode="fill_cancellation".
        inactive_customers: List of customer dicts with keys: name, phone,
                            last_visit_date, services_used, lifetime_value.
                            Required for mode="reactivate_lapsed".

    Returns:
        AgentResult with prioritised outreach messages and proposed send action.
    """
    llm = get_llm(model="gpt-4o-mini", temperature=0.5, max_tokens=1600)

    if mode not in ("fill_cancellation", "reactivate_lapsed"):
        return AgentResult(
            agent_id="atlas_waitlist_recall",
            coworker="atlas",
            status="failed",
            summary=f"Unknown mode '{mode}'. Use 'fill_cancellation' or 'reactivate_lapsed'.",
            data={"error": "invalid_mode"},
        )

    # ── Mock fallback ──────────────────────────────────────────────────────────
    if llm is None:
        if mode == "fill_cancellation":
            mock_messages = [
                {
                    "name": "Riya Sharma",
                    "phone": "+91-98765-00001",
                    "message": "Hi Riya! Great news — a teeth whitening slot just opened up for tomorrow at 10 AM. Would you like to grab it? Reply YES to confirm! 🦷✨",
                    "priority_rank": 1,
                },
                {
                    "name": "Arjun Mehta",
                    "phone": "+91-98765-00002",
                    "message": "Hi Arjun! A teeth whitening appointment opened tomorrow at 10 AM — you've been on our waitlist and this slot is perfect for you. Reply YES to book!",
                    "priority_rank": 2,
                },
                {
                    "name": "Priya Nair",
                    "phone": "+91-98765-00003",
                    "message": "Hi Priya! We have a last-minute opening for teeth whitening tomorrow morning. Interested? Let us know ASAP — it'll go fast! 😊",
                    "priority_rank": 3,
                },
            ]
            return AgentResult(
                agent_id="atlas_waitlist_recall",
                coworker="atlas",
                status="success",
                summary="Top 3 waitlist contacts ranked and personalised offer messages generated. Mock mode.",
                proposed_action={
                    "actionType": "send_waitlist_offers",
                    "payload": {"messages": mock_messages, "priority_order": ["Riya Sharma", "Arjun Mehta", "Priya Nair"]},
                },
                data={"slot": cancelled_slot, "messages": mock_messages},
                insights=[
                    "Slot matched to 3 waitlist contacts by service and priority.",
                    "Urgency messaging used without being pushy.",
                    "First reply to confirm wins the slot.",
                ],
                confidence_score=0.93,
            )
        # reactivate_lapsed mock
        mock_reactivations = [
            {
                "name": "Kavitha Rao",
                "phone": "+91-98765-00010",
                "message": "Hi Kavitha! It's been a while since your last cleaning with us — we miss you! Book your next visit this month and enjoy a complimentary fluoride treatment. 🦷",
                "last_visit": "2025-04-10",
            },
            {
                "name": "Suresh Pillai",
                "phone": "+91-98765-00011",
                "message": "Hi Suresh! Hope your smile has been great since your root canal! Time for your 6-month check-up. We're here when you're ready — book online or just reply.",
                "last_visit": "2025-06-22",
            },
        ]
        return AgentResult(
            agent_id="atlas_waitlist_recall",
            coworker="atlas",
            status="success",
            summary="Reactivation messages crafted for 2 lapsed customers. Mock mode.",
            proposed_action={
                "actionType": "send_reactivation_messages",
                "payload": {"messages": mock_reactivations, "priority_order": ["Kavitha Rao", "Suresh Pillai"]},
            },
            data={"messages": mock_reactivations},
            insights=[
                "Messages personalised to each patient's last service.",
                "Value offered beyond a discount (complimentary service).",
                "Prioritised by recency and lifetime value.",
            ],
            confidence_score=0.9,
        )

    # ── LLM path ──────────────────────────────────────────────────────────────
    try:
        if mode == "fill_cancellation":
            prompt = f"""A slot just opened. Rank the waitlist by best match and write personalised offer messages.

Cancelled slot: {json.dumps(cancelled_slot)}
Waitlist contacts: {json.dumps(waitlist)}

Respond with JSON:
{{
  "ranked_contacts": [
    {{
      "name": "...", "phone": "...", "priority_rank": 1,
      "message": "Urgent but non-pushy personalised WhatsApp message (max 200 chars)"
    }}
  ],
  "priority_order": ["name1", "name2", "name3"],
  "summary": "one-sentence summary"
}}
Return only valid JSON. Include top 3 contacts."""
        else:
            prompt = f"""Generate personalised reactivation messages for lapsed customers.

Inactive customers: {json.dumps(inactive_customers)}

For each customer:
- Reference their last service
- Offer genuine value (not just a discount)
- Be warm and personal

Respond with JSON:
{{
  "reactivation_messages": [
    {{
      "name": "...", "phone": "...", "last_visit": "...",
      "message": "Personalised reactivation WhatsApp message"
    }}
  ],
  "priority_order": ["name1", "name2"],
  "summary": "one-sentence summary"
}}
Return only valid JSON."""

        response = await llm.ainvoke(prompt)
        parsed = json.loads(clean_json_markdown(response.content))

        if mode == "fill_cancellation":
            messages = parsed.get("ranked_contacts", [])
            action_type = "send_waitlist_offers"
        else:
            messages = parsed.get("reactivation_messages", [])
            action_type = "send_reactivation_messages"

        return AgentResult(
            agent_id="atlas_waitlist_recall",
            coworker="atlas",
            status="success",
            summary=parsed.get("summary", f"{mode} messages generated."),
            proposed_action={
                "actionType": action_type,
                "payload": {"messages": messages, "priority_order": parsed.get("priority_order", [])},
            },
            data=parsed,
            insights=[
                f"Mode: {mode}",
                f"{len(messages)} personalised messages generated.",
                "Priority order computed based on match score and recency.",
            ],
            confidence_score=0.92,
        )

    except Exception as exc:
        return AgentResult(
            agent_id="atlas_waitlist_recall",
            coworker="atlas",
            status="failed",
            summary=f"Waitlist/recall agent error: {exc}",
            data={"error": str(exc)},
        )
