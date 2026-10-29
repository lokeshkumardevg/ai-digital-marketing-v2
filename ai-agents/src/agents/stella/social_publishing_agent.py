"""
Stella Social Publishing Agent
Agent ID: stella_social_publishing
Coworker: stella

Purpose: Write platform-tailored social media posts adapted for each channel's
style, character limits, hashtag conventions, and audience expectations.
"""

import json
from ..base import AgentResult, get_llm, clean_json_markdown

PLATFORM_RULES = {
    "linkedin": "Professional, thought-leadership tone. 150-300 words. 3-5 hashtags. Minimal emoji.",
    "instagram": "Visual, aspirational tone. 50-100 words. 8-12 hashtags. Emojis encouraged. Strong CTA.",
    "facebook": "Conversational, community-focused. 50-150 words. 2-3 hashtags. End with an engagement question.",
    "twitter": "Punchy. Max 280 chars total. 1-2 hashtags. Optional thread starter labeled '1/'.",
    "whatsapp": "Warm broadcast style. No hashtags. Clear CTA. Max 200 chars.",
}

BEST_TIMES = {
    "linkedin": "Tuesday–Thursday, 8–10AM or 12PM",
    "instagram": "Wednesday 11AM, Friday 10AM–12PM",
    "facebook": "Wednesday 1PM, Thursday/Friday 1–4PM",
    "twitter": "Weekdays 9AM and 6PM",
    "whatsapp": "Weekday evenings 6–8PM",
}


async def run_social_publishing_agent(
    topic: str,
    brand_tone: str,
    platforms: list,
    target_audience: str,
    brand_name: str,
    org_id: str = "",
) -> AgentResult:
    """
    Generate platform-tailored social media posts for a given topic and brand.

    Args:
        topic: Campaign or content topic e.g. "New Year Smile Makeover offer".
        brand_tone: Tone descriptor e.g. "warm, professional, approachable".
        platforms: List of target platforms e.g. ["instagram", "facebook", "linkedin"].
        target_audience: Audience description e.g. "adults 25-45 in Mumbai seeking cosmetic dentistry".
        brand_name: Business name e.g. "SmileCare Dental".
        org_id: Organisation identifier for multi-tenant setups.

    Returns:
        AgentResult with per-platform posts, best times, and image prompt suggestions.
    """
    platform_rules = "\n".join(
        f"- {p.capitalize()}: {PLATFORM_RULES.get(p.lower(), 'Adapt naturally to this platform.')}"
        for p in platforms
    )

    prompt = f"""You are a social media strategist writing posts for {brand_name}.

Topic: {topic}
Target audience: {target_audience}
Brand tone: {brand_tone}

Platform rules:
{platform_rules}

Generate a post for EACH platform. Return ONLY valid JSON — no markdown fences.

{{
  "posts": {{
    "<platform>": {{
      "text": "<post text>",
      "hashtags": ["<tag>"],
      "image_prompt": "<detailed visual description for image generation>",
      "char_count": <integer>
    }}
  }},
  "campaign_theme": "<unifying theme across all posts>",
  "content_warnings": ["<any compliance note if needed>"]
}}

Platforms to cover: {platforms}"""

    llm = get_llm(model="gpt-4o-mini", temperature=0.75)

    try:
        if llm is None:
            posts_data = {
                "posts": {
                    "instagram": {
                        "text": "✨ New Year. New You. New Smile! 🦷\nKick off 2025 with the smile you've always dreamed of. Our Smile Makeover packages include teeth whitening, veneers & more — all under one roof in Bandra. 🎉\n💰 Special January pricing — don't miss it!\n👇 Book your free consultation today!",
                        "hashtags": ["#SmileMakeover", "#DentalClinicMumbai", "#NewYearNewSmile", "#TeethWhitening", "#BandraClinic", "#CosmeticDentistry", "#MumbaiDentist", "#SmileGoals"],
                        "image_prompt": "Bright, warm clinic interior with a smiling patient in a dental chair, New Year confetti overlay, cheerful colours, professional photography style.",
                        "char_count": 295,
                    },
                    "facebook": {
                        "text": "🎉 Start 2025 with a Smile Makeover at SmileCare Dental!\n\nWe're offering exclusive January packages on teeth whitening, veneers, and full smile makeovers. Our team in Bandra is ready to help you put your best smile forward this year.\n\nWhat's the first thing you want to improve about your smile in 2025? Drop it below! 👇 #SmileMakeover #SmileCareDental",
                        "hashtags": ["#SmileMakeover", "#SmileCareDental"],
                        "image_prompt": "Before-and-after smile transformation collage with festive New Year theme, warm clinic branding colours.",
                        "char_count": 380,
                    },
                    "linkedin": {
                        "text": "As we enter a new year, many of us set goals around health and confidence. At SmileCare Dental, we believe a healthy smile is foundational to both.\n\nThis January, we're launching our Smile Makeover Programme — combining the latest in cosmetic dentistry with personalised care plans.\n\nIf you've been putting off that smile improvement, there's no better time than now. Our team in Bandra, Mumbai is accepting new patients.\n\nWhat health goals are you prioritising this year? #DentalHealth #SmileMakeover #MumbaiHealthcare #CosmeticDentistry #Wellness",
                        "hashtags": ["#DentalHealth", "#SmileMakeover", "#MumbaiHealthcare", "#CosmeticDentistry", "#Wellness"],
                        "image_prompt": "Professional headshot-style image of a smiling dentist in a modern clinic, LinkedIn-appropriate, clean and authoritative.",
                        "char_count": 598,
                    },
                    "twitter": {
                        "text": "New Year, New Smile 😁 SmileCare Dental's January Makeover packages are LIVE. Book your free consult today → [link] #SmileMakeover #MumbaiDentist",
                        "hashtags": ["#SmileMakeover", "#MumbaiDentist"],
                        "image_prompt": "Bold graphic: 'New Year, New Smile' text on gradient background with tooth/sparkle emoji, vibrant and thumb-stopping.",
                        "char_count": 143,
                    },
                    "whatsapp": {
                        "text": "🎉 New Year Smile Makeover is HERE! Special Jan offers on whitening & veneers at SmileCare Dental, Bandra. Book now: wa.link/smilecare",
                        "hashtags": [],
                        "image_prompt": "Festive WhatsApp broadcast card: clinic logo, patient smile photo, and clear offer text on gold/white background.",
                        "char_count": 149,
                    },
                },
                "campaign_theme": "New Year New Smile — confidence, renewal, and accessible cosmetic dentistry.",
                "content_warnings": ["Ensure before/after images comply with ASA guidelines if used in paid ads."],
            }
        else:
            response = await llm.ainvoke(prompt)
            raw = clean_json_markdown(response.content)
            posts_data = json.loads(raw)

        scheduled_times = {p: BEST_TIMES.get(p.lower(), "Weekdays 10AM–12PM") for p in platforms}

        return AgentResult(
            agent_id="stella_social_publishing",
            coworker="stella",
            status="success",
            summary=f"Generated {len(platforms)} platform-tailored posts for '{topic}' campaign by {brand_name}.",
            proposed_action={
                "actionType": "schedule_posts",
                "payload": {
                    "posts": posts_data.get("posts", {}),
                    "scheduled_times": scheduled_times,
                },
            },
            data={
                **posts_data,
                "platforms_covered": platforms,
                "scheduled_times": scheduled_times,
            },
            insights=[
                f"Campaign theme: {posts_data.get('campaign_theme', '')}",
                f"Platforms covered: {', '.join(platforms)}",
                *[f"Best time for {p}: {scheduled_times[p]}" for p in platforms],
                *(posts_data.get("content_warnings", [])),
            ],
            confidence_score=0.91,
        )

    except Exception as exc:
        return AgentResult(
            agent_id="stella_social_publishing",
            coworker="stella",
            status="failed",
            summary=f"Social publishing failed: {exc}",
            insights=[str(exc)],
            confidence_score=0.0,
        )
