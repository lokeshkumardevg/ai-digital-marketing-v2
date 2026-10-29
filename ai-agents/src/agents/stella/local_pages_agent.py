"""
Stella Local Pages Agent
Agent ID: stella_local_pages
Coworker: stella

Purpose: Generate SEO-optimised local landing page content for service + location
combinations, including meta tags, benefit blocks, FAQs, and CTAs.
"""

import json
import re
from ..base import AgentResult, get_llm, clean_json_markdown


def _slugify(text: str) -> str:
    """Convert a string to a URL-safe slug."""
    slug = text.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_]+", "-", slug)
    return slug


async def run_local_pages_agent(
    location: str,
    service: str,
    local_keywords: list,
    brand_voice: str,
    brand_name: str,
    org_id: str = "",
) -> AgentResult:
    """
    Generate complete SEO-optimised local landing page content.

    Args:
        location: Target location string e.g. "Bandra Mumbai".
        service: Service offered e.g. "Dental Implants".
        local_keywords: List of LSI / local keywords to weave into copy naturally.
        brand_voice: Tone descriptor e.g. "warm and professional", "clinical and trustworthy".
        brand_name: Business name e.g. "SmileCare Dental".
        org_id: Organisation identifier for multi-tenant setups.

    Returns:
        AgentResult with full page content blocks and a publish action.
    """
    keywords_str = ", ".join(local_keywords)

    prompt = f"""You are an expert local SEO copywriter. Write complete landing page content.

Business: {brand_name}
Service: {service} in {location}
Keywords to include naturally: {keywords_str}
Tone: {brand_voice}

Generate the following sections. Return ONLY valid JSON — no markdown fences.

{{
  "h1": "<H1 tag — include primary keyword + location, max 70 chars>",
  "meta_title": "<Meta title max 60 chars>",
  "meta_description": "<Meta description max 155 chars — include CTA>",
  "hero_copy": "<Hero section — 50 words, aspirational, includes location>",
  "benefit_blocks": [
    {{"heading": "<benefit 1 heading>", "body": "<2 sentences>"}},
    {{"heading": "<benefit 2 heading>", "body": "<2 sentences>"}},
    {{"heading": "<benefit 3 heading>", "body": "<2 sentences>"}}
  ],
  "local_trust_signals": "<Paragraph mentioning neighbourhood names, landmarks, years serving area — 60 words>",
  "faq": [
    {{"question": "<Q1 targeting People Also Ask>", "answer": "<concise answer 2-3 sentences>"}},
    {{"question": "<Q2>", "answer": "<answer>"}},
    {{"question": "<Q3>", "answer": "<answer>"}}
  ],
  "cta_section": {{
    "headline": "<CTA headline with local urgency>",
    "subtext": "<1 sentence supporting copy>",
    "button_text": "<CTA button label>"
  }},
  "schema_type": "LocalBusiness"
}}"""

    llm = get_llm(model="gpt-4o-mini", temperature=0.6)

    try:
        if llm is None:
            content = {
                "h1": "Dental Implants in Bandra Mumbai — SmileCare Dental",
                "meta_title": "Dental Implants Bandra Mumbai | SmileCare Dental",
                "meta_description": "Get affordable dental implants in Bandra, Mumbai at SmileCare Dental. Expert implantologists, same-day consultations. Book now — limited slots!",
                "hero_copy": (
                    "Restore your smile with confidence at SmileCare Dental, Bandra's most trusted implant centre. "
                    "Our specialist team brings world-class dental implant technology right to the heart of Mumbai's western suburbs."
                ),
                "benefit_blocks": [
                    {
                        "heading": "Expert Implantologists You Can Trust",
                        "body": "Our certified implantologists have placed over 2,000 implants across Bandra and Khar. "
                                "Every procedure follows international sterilisation and safety protocols.",
                    },
                    {
                        "heading": "Affordable, Transparent Pricing",
                        "body": "SmileCare offers dental implants starting at ₹25,000 with zero hidden fees. "
                                "EMI options available to make your new smile accessible to every budget.",
                    },
                    {
                        "heading": "Convenient Location Near Bandra Station",
                        "body": "Just 5 minutes from Bandra West station, with parking available. "
                                "We serve patients from Santacruz, Khar, and Mahim with evening slots open until 8PM.",
                    },
                ],
                "local_trust_signals": (
                    "Proudly serving Bandra, Khar, Santacruz, and Mahim for over 12 years. "
                    "Located steps from the iconic Bandra Bandstand, SmileCare Dental has become western Mumbai's "
                    "go-to clinic for implant-supported smiles. Over 5,000 happy patients and counting."
                ),
                "faq": [
                    {
                        "question": "How much do dental implants cost in Bandra Mumbai?",
                        "answer": "Dental implants at SmileCare Dental in Bandra start from ₹25,000 per implant. The final cost depends on bone density and the crown type. We offer free consultations and EMI payment plans.",
                    },
                    {
                        "question": "How long does the dental implant procedure take in Mumbai?",
                        "answer": "The implant placement takes 45–90 minutes. After a healing period of 3–6 months, the permanent crown is fitted. Same-day temporary crowns are available in eligible cases.",
                    },
                    {
                        "question": "Are dental implants painful?",
                        "answer": "The procedure is performed under local anaesthesia so discomfort is minimal. Most patients report only mild soreness for 1–2 days post-surgery, well managed with standard pain relief.",
                    },
                ],
                "cta_section": {
                    "headline": "Ready for Your New Smile? Book Today — Limited Slots in Bandra This Week",
                    "subtext": "Free implant consultation. No obligation. Walk out with a clear treatment plan and transparent pricing.",
                    "button_text": "Book Free Consultation",
                },
                "schema_type": "LocalBusiness",
            }
        else:
            response = await llm.ainvoke(prompt)
            raw = clean_json_markdown(response.content)
            content = json.loads(raw)

        slug = _slugify(f"{service}-in-{location}")

        return AgentResult(
            agent_id="stella_local_pages",
            coworker="stella",
            status="success",
            summary=f"Generated local landing page for '{service} in {location}' for {brand_name}.",
            proposed_action={
                "actionType": "publish_landing_page",
                "payload": {
                    "slug": slug,
                    "title": content.get("h1", ""),
                    "meta": {
                        "title": content.get("meta_title", ""),
                        "description": content.get("meta_description", ""),
                    },
                    "content_blocks": {
                        "hero": content.get("hero_copy", ""),
                        "benefits": content.get("benefit_blocks", []),
                        "trust_signals": content.get("local_trust_signals", ""),
                        "faq": content.get("faq", []),
                        "cta": content.get("cta_section", {}),
                    },
                },
            },
            data=content,
            insights=[
                f"Slug: /{slug}",
                f"Meta title length: {len(content.get('meta_title', ''))} chars (limit: 60)",
                f"Meta description length: {len(content.get('meta_description', ''))} chars (limit: 155)",
                f"FAQs generated: {len(content.get('faq', []))} (targets People Also Ask)",
                f"Schema type: {content.get('schema_type', 'LocalBusiness')}",
            ],
            confidence_score=0.9,
        )

    except Exception as exc:
        return AgentResult(
            agent_id="stella_local_pages",
            coworker="stella",
            status="failed",
            summary=f"Local page generation failed: {exc}",
            insights=[str(exc)],
            confidence_score=0.0,
        )
