"""
Atlas Multimodal Voice Agent
Agent ID: atlas_multimodal_voice
Coworker: Atlas (Operations Coworker)

Processes voice call transcripts. Detects language (English / Hindi / Hinglish)
and generates responses in the same language. Extracts intent, key info, and
produces a CRM-ready call summary.
"""

import json
import re
from ..base import AgentResult, get_llm, clean_json_markdown

# Common Hindi / Hinglish indicator words
_HINGLISH_WORDS = {
    "aap", "mujhe", "kya", "hai", "nahi", "haan", "theek",
    "appointment", "doctor", "kal", "aaj", "bahut", "dard",
    "chahiye", "bata", "please", "mera", "meri", "mere",
}

_DEVANAGARI_RE = re.compile(r"[\u0900-\u097F]")


def _detect_language(transcript: str) -> str:
    """Heuristic language detection: hindi, hinglish, or english."""
    if _DEVANAGARI_RE.search(transcript):
        return "hindi"
    lower_words = set(transcript.lower().split())
    if lower_words & _HINGLISH_WORDS:
        return "hinglish"
    return "english"


async def run_multimodal_voice_agent(
    transcript: str,
    detected_language: str = "auto",
    intent: str = "",
    call_type: str = "inbound",
    org_id: str = "",
) -> AgentResult:
    """
    Analyse a voice call transcript and generate a contextual response.

    Supports English, Hindi, and Hinglish. Produces a CRM note alongside the
    response so staff can review without listening to the full recording.

    Args:
        transcript: Raw text transcript of the voice call.
        detected_language: "auto" to auto-detect, or one of "english", "hindi", "hinglish".
        intent: Pre-detected intent (optional; LLM will also extract it).
        call_type: "inbound" or "outbound".
        org_id: Optional organisation identifier.

    Returns:
        AgentResult with the agent's response text, CRM note, extracted caller
        info, and the required action.
    """
    language = detected_language if detected_language != "auto" else _detect_language(transcript)

    llm = get_llm(model="gpt-4o-mini", temperature=0.4, max_tokens=1200)

    if llm is None:
        response_text = (
            "Haan, bilkul! Aapka appointment kal ke liye book kar dete hain. "
            "Aapka naam aur contact number bata dijiye please?"
            if language == "hinglish"
            else "Of course! Let me book an appointment for you. Can I get your name and contact number?"
        )
        return AgentResult(
            agent_id="atlas_multimodal_voice",
            coworker="atlas",
            status="success",
            summary=f"Voice call processed ({language}, {call_type}). Intent: tooth pain / urgent appointment. Mock mode.",
            proposed_action={
                "actionType": "process_voice_call",
                "payload": {
                    "response_text": response_text,
                    "language": language,
                    "crm_note": (
                        "Patient called reporting acute tooth pain. Requested same-day appointment. "
                        "Caller expressed urgency — triage recommended. Follow-up booking flow initiated."
                    ),
                    "action_required": "book_appointment",
                    "extracted_info": {
                        "name": None,
                        "date_mentioned": "kal (tomorrow)",
                        "service_requested": "Emergency dental exam",
                        "concerns": "Tooth pain (bahut dard)",
                    },
                },
            },
            data={
                "detected_language": language,
                "call_type": call_type,
                "primary_intent": "urgent_appointment",
                "sentiment": "distressed",
                "response_text": response_text,
                "crm_note": "Caller: tooth pain, wants same-day. Escalate to triage.",
                "action_required": "book_appointment",
                "extracted_info": {
                    "name": None,
                    "date_mentioned": "kal (tomorrow)",
                    "service_requested": "Emergency dental exam",
                    "concerns": "Tooth pain (bahut dard)",
                },
            },
            insights=[
                f"Language detected: {language}",
                "Sentiment: distressed",
                "Action required: book_appointment (urgent)",
            ],
            confidence_score=0.91,
        )

    try:
        lang_instruction = (
            "Respond in natural Hinglish (mix Hindi and English naturally)."
            if language == "hinglish"
            else "Respond in Hindi (Devanagari script optional, Roman transliteration preferred for SMS)."
            if language == "hindi"
            else "Respond in clear, professional English."
        )

        prompt = f"""You are handling a voice call transcript.
Language detected: {language}
Call type: {call_type} (inbound/outbound)
Transcript: "{transcript}"

{lang_instruction}

Analyse and respond with JSON:
{{
  "primary_intent": "urgent_appointment | general_inquiry | complaint | callback_requested | other",
  "sentiment": "positive | neutral | frustrated | distressed",
  "extracted_info": {{
    "name": "caller name if mentioned, else null",
    "date_mentioned": "any date/time mentioned, else null",
    "service_requested": "service they want, else null",
    "concerns": "key concern or complaint"
  }},
  "response_text": "Your response to the caller in the SAME language as the transcript ({language})",
  "action_required": "book_appointment | answer_query | escalate | callback_requested",
  "crm_note": "2-3 sentence CRM summary of this call for staff review",
  "summary": "one-sentence overall summary"
}}
Return only valid JSON."""

        response = await llm.ainvoke(prompt)
        parsed = json.loads(clean_json_markdown(response.content))

        return AgentResult(
            agent_id="atlas_multimodal_voice",
            coworker="atlas",
            status="success",
            summary=parsed.get("summary", f"Voice call processed ({language})."),
            proposed_action={
                "actionType": "process_voice_call",
                "payload": {
                    "response_text": parsed.get("response_text"),
                    "language": language,
                    "crm_note": parsed.get("crm_note"),
                    "action_required": parsed.get("action_required"),
                    "extracted_info": parsed.get("extracted_info", {}),
                },
            },
            data={**parsed, "detected_language": language, "call_type": call_type},
            insights=[
                f"Language: {language}",
                f"Sentiment: {parsed.get('sentiment')}",
                f"Action required: {parsed.get('action_required')}",
            ],
            confidence_score=0.92,
        )

    except Exception as exc:
        return AgentResult(
            agent_id="atlas_multimodal_voice",
            coworker="atlas",
            status="failed",
            summary=f"Voice agent error: {exc}",
            data={"error": str(exc)},
        )
