"""
Echo Survey Agent (echo_survey)
Compose CSAT/NPS WhatsApp surveys and parse survey response text to extract rating/sentiment.
"""

import json
from ..base import AgentResult, get_llm, clean_json_markdown


async def run_survey_agent(
    customer: dict,
    service_type: str,
    mode: str = "compose",
    survey_response_text: str = "",
    org_id: str = "",
) -> AgentResult:
    """
    Compose a 3-question WhatsApp survey or parse a survey response.

    Args:
        customer: {name, phone, email, last_service_date}
        service_type: Type of service the customer received (e.g. "dental cleaning").
        mode: "compose" to generate survey, "parse_response" to analyse reply text.
        survey_response_text: Raw customer reply text (used only in parse_response mode).
        org_id: Organisation identifier.

    Returns:
        AgentResult with survey content or parsed response data.
    """
    try:
        llm = get_llm(model="gpt-4o-mini", temperature=0.6, max_tokens=800)

        if mode == "compose":
            if llm:
                prompt = (
                    f"You are a friendly customer-experience assistant. "
                    f"Write a 3-question WhatsApp survey for {customer.get('name')} who just had a {service_type}.\n\n"
                    "Requirements:\n"
                    "1. NPS question (exact wording): 'On a scale of 0-10, how likely are you to recommend us?'\n"
                    "2. CSAT question: one specific question about the quality of the service (customised to the service type).\n"
                    "3. Open feedback: one open question (e.g. 'What could we have done better?' or 'What did you love most?').\n\n"
                    "Format: conversational, numbered, emoji-friendly, max 300 chars total for the 3 questions combined.\n"
                    "Also provide:\n"
                    "- intro_message: warm intro (max 30 words)\n"
                    "- thankyou_message: thank-you message to send after completion (max 30 words)\n\n"
                    "Respond ONLY with valid JSON:\n"
                    '{"intro_message": "...", "questions": ["...", "...", "..."], "thankyou_message": "..."}'
                )
                result = await llm.ainvoke(prompt)
                parsed = json.loads(clean_json_markdown(result.content))
            else:
                parsed = {
                    "intro_message": "Hi Priya! 👋 We hope your dental cleaning went smoothly. We'd love your feedback — it only takes a minute!",
                    "questions": [
                        "1️⃣ On a scale of 0-10, how likely are you to recommend us?",
                        "2️⃣ How satisfied were you with the thoroughness of your dental cleaning today? (1=Poor, 5=Excellent)",
                        "3️⃣ What could we have done better? Feel free to share anything! 😊",
                    ],
                    "thankyou_message": "Thank you so much, Priya! 🙏 Your feedback helps us serve you better. See you at your next visit!",
                }

            return AgentResult(
                agent_id="echo_survey",
                coworker="echo",
                status="success",
                summary=f"WhatsApp survey composed for {customer.get('name')} ({service_type}).",
                proposed_action={
                    "actionType": "send_survey_whatsapp",
                    "payload": {
                        "phone": customer.get("phone"),
                        "intro_message": parsed["intro_message"],
                        "questions": parsed["questions"],
                        "thankyou_message": parsed["thankyou_message"],
                        "service_type": service_type,
                    },
                },
                data=parsed,
                insights=[
                    "Survey uses exact NPS wording for benchmark compatibility.",
                    f"CSAT question customised to '{service_type}'.",
                ],
                confidence_score=0.93,
            )

        # parse_response mode
        if llm:
            prompt = (
                f"Parse this survey response and extract structured data.\n"
                f"Response text: \"{survey_response_text}\"\n\n"
                "Extract and return ONLY valid JSON:\n"
                '{"nps_score": <0-10 or null>, "csat_sentiment": "<positive|neutral|negative>", '
                '"key_feedback_themes": ["..."], "overall_satisfaction_score": <0.0-1.0>, "requires_followup": <true|false>}\n\n'
                "Rules:\n"
                "- requires_followup = true if nps_score < 7 OR csat_sentiment is negative.\n"
                "- overall_satisfaction_score: derive from NPS and sentiment."
            )
            result = await llm.ainvoke(prompt)
            parsed = json.loads(clean_json_markdown(result.content))
        else:
            parsed = {
                "nps_score": 8,
                "csat_sentiment": "positive",
                "key_feedback_themes": ["good service", "friendly staff"],
                "overall_satisfaction_score": 0.82,
                "requires_followup": False,
            }

        requires_followup = parsed.get("requires_followup", False)
        return AgentResult(
            agent_id="echo_survey",
            coworker="echo",
            status="success",
            summary=f"Survey response parsed. NPS: {parsed.get('nps_score')}, Sentiment: {parsed.get('csat_sentiment')}.",
            proposed_action={
                "actionType": "save_survey_response",
                "payload": {**parsed, "requires_followup": requires_followup},
                "followup_required": requires_followup,
            },
            data=parsed,
            insights=[
                f"NPS score: {parsed.get('nps_score')} — {'below threshold, follow-up triggered' if requires_followup else 'healthy score'}.",
                f"Key themes: {', '.join(parsed.get('key_feedback_themes', []))}.",
            ],
            confidence_score=0.91,
        )

    except Exception as exc:
        return AgentResult(
            agent_id="echo_survey",
            coworker="echo",
            status="failed",
            summary=f"Survey agent failed: {exc}",
            data={"error": str(exc)},
        )
