"""
Stella Review Response Agent
Agent ID: stella_review_response
Coworker: stella

Purpose: Generate HEART-framework review responses. Detects legal threats and
financial escalations before reaching the LLM, and handles angry customers
with prioritised response guidance.
"""

import json
from ..base import AgentResult, get_llm, clean_json_markdown

LEGAL_KEYWORDS = ["lawsuit", "sue", "attorney", "lawyer", "court", "legal action"]
REFUND_KEYWORDS = ["refund", "money back", "chargeback"]


async def run_review_response_agent(
    review_text: str,
    star_rating: int,
    reviewer_name: str,
    brand_voice: str = "professional",
    platform: str = "google",
    org_id: str = "",
) -> AgentResult:
    """
    Craft a HEART-framework response to a customer review.

    Pre-checks for legal threats and refund demands trigger human escalation
    before any LLM call. Low-star reviews raise response priority automatically.

    Args:
        review_text: The full text of the customer review.
        star_rating: Star rating (1–5).
        reviewer_name: Display name of the reviewer.
        brand_voice: Tone descriptor e.g. 'professional', 'friendly', 'clinical'.
        platform: Review platform — 'google', 'yelp', 'facebook', etc.
        org_id: Organisation identifier for multi-tenant setups.

    Returns:
        AgentResult with a drafted reply or an escalation action.
    """
    review_lower = review_text.lower()

    # --- Pre-LLM escalation checks ---
    legal_flag = any(kw in review_lower for kw in LEGAL_KEYWORDS)
    refund_flag = any(kw in review_lower for kw in REFUND_KEYWORDS) and star_rating <= 2

    if legal_flag or refund_flag:
        reason = "Legal threat detected in review." if legal_flag else "Refund demand on low-star review."
        return AgentResult(
            agent_id="stella_review_response",
            coworker="stella",
            status="escalated",
            summary=f"Review by {reviewer_name} requires human escalation. {reason}",
            proposed_action={
                "actionType": "human_escalation",
                "payload": {
                    "reply_text": None,
                    "platform": platform,
                    "escalation_reason": reason,
                    "reviewer_name": reviewer_name,
                    "star_rating": star_rating,
                    "review_text": review_text,
                },
            },
            data={"legal_flag": legal_flag, "refund_flag": refund_flag},
            insights=[reason, "Do NOT respond publicly until legal/management reviews this."],
            confidence_score=1.0,
        )

    # Priority flag for angry/low-star reviews
    is_angry = star_rating <= 2
    confidence = 0.6 if is_angry else 0.92
    extra_insights = ["Priority: Respond within 2 hours"] if is_angry else []

    max_words = 200 if platform == "google" else 300
    tone_guidance = (
        "Use the HEART framework: Hear → Empathize → Apologize (if warranted) → Resolve → Thank."
        if is_angry
        else "Amplify loyalty, invite a return visit, highlight the specific service they praised."
    )

    prompt = f"""You are a {brand_voice} customer experience specialist writing a review response.

Review platform: {platform}
Reviewer: {reviewer_name}
Star rating: {star_rating}/5
Review: "{review_text}"

{tone_guidance}

Rules:
- Max {max_words} words
- Do NOT offer discounts or free services publicly
- Do NOT be defensive or dismissive
- If apologising, be brief and sincere
- End with a warm invitation to reconnect

Return ONLY valid JSON (no markdown):
{{
  "reply_text": "<your crafted reply>",
  "response_tone": "<detected tone: empathetic|appreciative|apologetic|neutral>",
  "escalation_flag": false,
  "word_count": <integer>
}}"""

    llm = get_llm(model="gpt-4o-mini", temperature=0.4)

    try:
        if llm is None:
            result_data = {
                "reply_text": (
                    f"Dear {reviewer_name}, thank you for sharing your experience. "
                    "We sincerely apologise for the wait time — your time is valuable and we fell short. "
                    "We've reviewed our scheduling process and are actively improving. "
                    "We'd love the opportunity to make this right. Please reach us at reception "
                    "and we'll prioritise your next visit. Warm regards, The Team."
                    if is_angry else
                    f"Thank you so much, {reviewer_name}! We're thrilled you had a great experience. "
                    "It's patients like you who inspire us every day. We look forward to seeing you again soon! 😊"
                ),
                "response_tone": "empathetic" if is_angry else "appreciative",
                "escalation_flag": False,
                "word_count": 55,
            }
        else:
            response = await llm.ainvoke(prompt)
            raw = clean_json_markdown(response.content)
            result_data = json.loads(raw)

        return AgentResult(
            agent_id="stella_review_response",
            coworker="stella",
            status="success",
            summary=f"Drafted {result_data.get('response_tone', 'professional')} response to {star_rating}★ review by {reviewer_name}.",
            proposed_action={
                "actionType": "post_review_reply",
                "payload": {
                    "reply_text": result_data.get("reply_text", ""),
                    "platform": platform,
                    "escalation_reason": None,
                },
            },
            data=result_data,
            insights=extra_insights + [
                f"Response tone: {result_data.get('response_tone', 'N/A')}",
                f"Word count: {result_data.get('word_count', 'N/A')} (limit: {max_words})",
                "HEART framework applied." if is_angry else "Loyalty amplification applied.",
            ],
            confidence_score=confidence,
        )

    except Exception as exc:
        return AgentResult(
            agent_id="stella_review_response",
            coworker="stella",
            status="failed",
            summary=f"Review response generation failed: {exc}",
            insights=[str(exc)],
            confidence_score=0.0,
        )
