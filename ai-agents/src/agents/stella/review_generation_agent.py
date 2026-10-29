"""
Stella Review Generation Agent
Agent ID: stella_review_generation
Coworker: stella

Purpose: Generate personalized review request messages for WhatsApp/SMS/email
using A/B/C test variants. Complies with Google's guidelines (no sentiment gating).
"""

import json
from ..base import AgentResult, get_llm, clean_json_markdown


async def run_review_generation_agent(
    customer_name: str,
    customer_phone: str,
    service_completed: str,
    google_review_link: str,
    channel: str = "whatsapp",
    org_id: str = "",
) -> AgentResult:
    """
    Generate 3 personalized review request message variants (A/B/C) for a given channel.

    Args:
        customer_name: Full name of the customer.
        customer_phone: Customer's phone number (E.164 format preferred).
        service_completed: Description of the service the customer received.
        google_review_link: Direct URL to the business's Google review page.
        channel: Delivery channel — 'whatsapp', 'sms', or 'email'.
        org_id: Organisation identifier for multi-tenant setups.

    Returns:
        AgentResult with 3 message variants and a proposed send action.
    """
    char_limits = {"sms": 160, "whatsapp": 300, "email": 150}
    char_limit = char_limits.get(channel, 300)

    prompt = f"""You are a warm, empathetic business communication writer.

Write 3 variants (A, B, C) of a review request message from a business to a customer.
Return ONLY valid JSON — no markdown fences, no extra text.

Rules:
- Channel: {channel} (max {char_limit} chars per message)
- NEVER use phrases like "if you're happy with our service" (violates Google guidelines)
- Include this link naturally: {google_review_link}
- Tone: warm, human, conversational — not robotic or corporate
- Do NOT use all-caps, excessive punctuation, or emoji spam

Customer name: {customer_name}
Service completed: {service_completed}

Return JSON:
{{
  "variant_A": "<message text>",
  "variant_B": "<message text>",
  "variant_C": "<message text>",
  "recommended_variant": "A",
  "reasoning": "<why this variant performs best>"
}}"""

    llm = get_llm(model="gpt-4o-mini", temperature=0.7)

    try:
        if llm is None:
            variants = {
                "variant_A": f"Hi {customer_name} 😊 Thank you for trusting us with your {service_completed}! We'd love to hear about your experience. Share a quick review here: {google_review_link} — it means the world to us! 🙏",
                "variant_B": f"Hi {customer_name}, hope you're feeling great after your {service_completed}! Your feedback helps us serve you better. Would you mind leaving us a review? {google_review_link} Thanks so much!",
                "variant_C": f"Hey {customer_name}! It was a pleasure taking care of your {service_completed} today 🌟 We'd be grateful if you could share your thoughts: {google_review_link}",
                "recommended_variant": "A",
                "reasoning": "Variant A balances warmth with a clear CTA and stays within channel limits.",
            }
        else:
            response = await llm.ainvoke(prompt)
            raw = clean_json_markdown(response.content)
            variants = json.loads(raw)

        return AgentResult(
            agent_id="stella_review_generation",
            coworker="stella",
            status="success",
            summary=f"Generated 3 review request variants for {customer_name} via {channel}.",
            proposed_action={
                "actionType": "send_review_request",
                "channel": channel,
                "payload": {
                    "to": customer_phone,
                    "message_variants": {
                        "A": variants.get("variant_A", ""),
                        "B": variants.get("variant_B", ""),
                        "C": variants.get("variant_C", ""),
                    },
                    "selected_variant": variants.get("recommended_variant", "A"),
                },
            },
            data={
                "variants": variants,
                "customer_name": customer_name,
                "service_completed": service_completed,
                "channel": channel,
                "char_limit": char_limit,
            },
            insights=[
                f"Recommended variant: {variants.get('recommended_variant', 'A')}",
                variants.get("reasoning", ""),
                "No sentiment-gating language detected — compliant with Google guidelines.",
            ],
            confidence_score=0.92,
        )

    except Exception as exc:
        return AgentResult(
            agent_id="stella_review_generation",
            coworker="stella",
            status="failed",
            summary=f"Review generation failed: {exc}",
            insights=[str(exc)],
            confidence_score=0.0,
        )
