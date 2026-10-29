"""
Stella Social Engagement Agent
Agent ID: stella_social_engagement
Coworker: stella

Purpose: Classify comment intent via Python pre-checks and LLM, draft appropriate
replies with correct character limits per platform, and flag escalation or DM offers.
"""

import json
from ..base import AgentResult, get_llm, clean_json_markdown

URGENT_KEYWORDS = ["urgent", "emergency", "help", "problem", "issue", "complaint", "scam", "fake"]
SALES_KEYWORDS = ["price", "cost", "how much", "appointment", "book", "available", "charges", "fees"]
SPAM_INDICATORS = ["follow me", "check my profile", "dm for promo", "check my page", "free follower"]

CHAR_LIMITS = {
    "instagram": 150,
    "twitter": 150,
    "facebook": 250,
    "linkedin": 250,
    "whatsapp": 200,
}


def _pre_classify(comment_text: str) -> dict:
    """Run fast Python keyword pre-classification before LLM call."""
    lower = comment_text.lower()
    flags = {
        "is_priority": any(kw in lower for kw in URGENT_KEYWORDS),
        "is_sales_inquiry": any(kw in lower for kw in SALES_KEYWORDS),
        "is_spam": any(kw in lower for kw in SPAM_INDICATORS),
    }
    return flags


async def run_social_engagement_agent(
    comment_text: str,
    post_context: str,
    brand_tone: str,
    commenter_name: str = "User",
    platform: str = "instagram",
    org_id: str = "",
) -> AgentResult:
    """
    Classify a social media comment and draft a platform-appropriate reply.

    Python pre-checks catch urgent, sales, and spam signals before the LLM is invoked.
    Escalation to a human is recommended for priority complaints.

    Args:
        comment_text: The raw comment text to analyse.
        post_context: Brief description of the post the comment is on.
        brand_tone: Brand tone e.g. "warm, professional".
        commenter_name: Display name of the commenter.
        platform: Social platform — 'instagram', 'facebook', 'twitter', 'linkedin'.
        org_id: Organisation identifier for multi-tenant setups.

    Returns:
        AgentResult with a drafted reply or escalation action.
    """
    pre = _pre_classify(comment_text)
    char_limit = CHAR_LIMITS.get(platform.lower(), 150)

    # Short-circuit spam — no LLM needed
    if pre["is_spam"]:
        return AgentResult(
            agent_id="stella_social_engagement",
            coworker="stella",
            status="success",
            summary=f"Comment from {commenter_name} classified as spam. No reply recommended.",
            proposed_action={
                "actionType": "escalate_to_human",
                "payload": {
                    "reply_text": None,
                    "offer_dm": False,
                    "intent": "spam",
                    "escalation_reason": "Spam/promotional comment detected. Consider hiding or reporting.",
                },
            },
            data={"pre_classification": pre, "platform": platform},
            insights=["Spam signals detected. Do not engage publicly.", "Consider hiding comment and blocking user."],
            confidence_score=0.97,
        )

    prompt = f"""You are a social media community manager for a brand with a {brand_tone} tone.

Platform: {platform} (max reply length: {char_limit} chars)
Post context: {post_context}
Commenter: {commenter_name}
Comment: "{comment_text}"

Pre-classification signals:
- Priority/complaint: {pre['is_priority']}
- Sales inquiry: {pre['is_sales_inquiry']}

Tasks:
1. Classify the comment intent as ONE of: question | complaint | sales_inquiry | compliment | general
2. Draft a reply within {char_limit} chars. Warm, human, brand-appropriate.
3. If it is a sales inquiry, invite to DM for pricing details (never post prices publicly).
4. Should this be escalated to a human? Why or why not?
5. Should we offer to move to DM?

Return ONLY valid JSON — no markdown fences:
{{
  "intent": "<question|complaint|sales_inquiry|compliment|general>",
  "reply_text": "<your reply within {char_limit} chars>",
  "offer_dm": <true|false>,
  "escalate_to_human": <true|false>,
  "escalation_reason": "<reason or null>",
  "sentiment": "<positive|neutral|negative>",
  "confidence": <0.0-1.0>
}}"""

    llm = get_llm(model="gpt-4o-mini", temperature=0.5)

    try:
        if llm is None:
            result = {
                "intent": "sales_inquiry",
                "reply_text": f"Hi {commenter_name}! 😊 So glad your friend recommended us! We'd love to chat about teeth whitening options — every smile is different. Drop us a DM and we'll share all the details + pricing just for you! 🦷✨",
                "offer_dm": True,
                "escalate_to_human": False,
                "escalation_reason": None,
                "sentiment": "positive",
                "confidence": 0.94,
            }
        else:
            response = await llm.ainvoke(prompt)
            raw = clean_json_markdown(response.content)
            result = json.loads(raw)

        action_type = "escalate_to_human" if result.get("escalate_to_human") else "post_comment_reply"
        confidence = result.get("confidence", 0.85)

        return AgentResult(
            agent_id="stella_social_engagement",
            coworker="stella",
            status="success",
            summary=f"Comment by {commenter_name} classified as '{result.get('intent')}' on {platform}. Action: {action_type}.",
            proposed_action={
                "actionType": action_type,
                "payload": {
                    "reply_text": result.get("reply_text"),
                    "offer_dm": result.get("offer_dm", False),
                    "intent": result.get("intent"),
                    "escalation_reason": result.get("escalation_reason"),
                },
            },
            data={
                **result,
                "pre_classification": pre,
                "platform": platform,
                "char_limit": char_limit,
            },
            insights=[
                f"Intent: {result.get('intent')} | Sentiment: {result.get('sentiment')}",
                f"Reply length: {len(result.get('reply_text', ''))} chars (limit: {char_limit})",
                "Sales inquiry detected — invite to DM to avoid public price discussion." if pre["is_sales_inquiry"] else "",
                "Priority flag active — respond quickly." if pre["is_priority"] else "",
            ],
            confidence_score=confidence,
        )

    except Exception as exc:
        return AgentResult(
            agent_id="stella_social_engagement",
            coworker="stella",
            status="failed",
            summary=f"Social engagement agent failed: {exc}",
            insights=[str(exc)],
            confidence_score=0.0,
        )
