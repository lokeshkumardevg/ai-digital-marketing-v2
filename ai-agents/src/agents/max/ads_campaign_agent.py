"""
Max - Ads Campaign Agent
Agent ID: max_ads_campaign
Purpose: Draft multi-platform ad campaign strategy and copy.
"""

import json
from typing import List
from ..base import AgentResult, get_llm, clean_json_markdown


async def run_ads_campaign_agent(
    brand_name: str,
    industry: str,
    budget: float,
    objective: str,
    platforms: list[str],
    org_id: str = "",
) -> AgentResult:
    """
    Generate a multi-platform ad campaign strategy, ad copy, budget splits,
    and audience recommendations for a given brand.

    Args:
        brand_name: Name of the brand.
        industry: Industry/vertical of the brand.
        budget: Total ad budget in USD.
        objective: Campaign objective (e.g., 'lead_generation', 'brand_awareness').
        platforms: List of platforms (e.g., ['Google', 'Meta']).
        org_id: Organisation identifier.

    Returns:
        AgentResult with campaign strategy, ad copy, budget breakdown, and audiences.
    """
    llm = get_llm(model="gpt-4o-mini", temperature=0.6, max_tokens=2500)

    if llm is None:
        # Realistic mock for a dental clinic running Google + Meta
        return AgentResult(
            agent_id="max_ads_campaign",
            coworker="max",
            status="success",
            summary=(
                f"Mock campaign strategy generated for {brand_name}. "
                "Google Search targets high-intent queries; Meta drives awareness and retargeting."
            ),
            data={
                "campaign_strategy": (
                    f"{brand_name} will run a dual-channel campaign combining Google Search for "
                    "high-intent patients actively seeking dental care with Meta ads for awareness "
                    "and retargeting website visitors. The strategy prioritises lead volume within "
                    "the given budget while building local brand equity. Ads will be A/B tested "
                    "fortnightly to optimise CTR and CPL."
                ),
                "ad_copies": {
                    "Google": {
                        "headline_1": "Top Dental Clinic Near You",
                        "headline_2": "Book a Free Consultation Today",
                        "headline_3": "Trusted by 5,000+ Patients",
                        "description": (
                            "Affordable dental care with expert doctors. "
                            "Same-day appointments available. Call now!"
                        ),
                        "cta": "Book Now",
                    },
                    "Meta": {
                        "headline": "Smile With Confidence — Starting at ₹999",
                        "primary_text": (
                            "Don't let dental pain hold you back. "
                            f"{brand_name} offers painless treatments, "
                            "EMI options, and certified specialists."
                        ),
                        "description": "Limited slots available this week.",
                        "cta": "Get Free Consultation",
                    },
                },
                "budget_split": {
                    "Google": round(budget * 0.60, 2),
                    "Meta": round(budget * 0.40, 2),
                },
                "suggested_audiences": [
                    "Ages 25-55, local radius 10 km, interest: dental health",
                    "Retargeting: website visitors last 30 days",
                    "Lookalike: existing patient list (1-3%)",
                ],
            },
            proposed_action={
                "actionType": "launch_campaign",
                "platforms": platforms,
                "payload": {
                    "campaign_name": f"{brand_name} — {objective.replace('_', ' ').title()} Campaign",
                    "total_budget": budget,
                    "objective": objective,
                    "platform_breakdown": {
                        "Google": round(budget * 0.60, 2),
                        "Meta": round(budget * 0.40, 2),
                    },
                    "ad_copies": {
                        "Google": {"headline_1": "Top Dental Clinic Near You", "cta": "Book Now"},
                        "Meta": {"headline": "Smile With Confidence", "cta": "Get Free Consultation"},
                    },
                },
            },
            insights=[
                "Allocate 60% to Google Search for high purchase-intent traffic.",
                "Use Meta carousel ads to showcase before/after treatment results.",
                "Schedule ads during peak hours (7–9 AM, 6–9 PM) to reduce CPL.",
            ],
            confidence_score=0.82,
        )

    prompt = f"""
You are a senior digital marketing strategist. Generate a complete ad campaign for:
- Brand: {brand_name}
- Industry: {industry}
- Budget: ${budget}
- Objective: {objective}
- Platforms: {', '.join(platforms)}

Return a JSON object with these keys:
{{
  "campaign_strategy": "3-5 sentence strategy overview",
  "ad_copies": {{
    "<platform>": {{"headline_1": "...", "headline_2": "...", "description": "...", "cta": "..."}}
  }},
  "budget_split": {{"<platform>": <dollar_amount>}},
  "suggested_audiences": ["audience 1", "audience 2", "audience 3"],
  "summary": "One sentence summary"
}}

Return ONLY the JSON object, no markdown fences.
"""

    try:
        from langchain_core.messages import HumanMessage
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        parsed = json.loads(clean_json_markdown(response.content))

        return AgentResult(
            agent_id="max_ads_campaign",
            coworker="max",
            status="success",
            summary=parsed.get("summary", "Ad campaign strategy generated successfully."),
            data={
                "campaign_strategy": parsed.get("campaign_strategy", ""),
                "ad_copies": parsed.get("ad_copies", {}),
                "budget_split": parsed.get("budget_split", {}),
                "suggested_audiences": parsed.get("suggested_audiences", []),
            },
            proposed_action={
                "actionType": "launch_campaign",
                "platforms": platforms,
                "payload": {
                    "campaign_name": f"{brand_name} — {objective.replace('_', ' ').title()} Campaign",
                    "total_budget": budget,
                    "objective": objective,
                    "platform_breakdown": parsed.get("budget_split", {}),
                    "ad_copies": parsed.get("ad_copies", {}),
                },
            },
            insights=[
                f"Prioritise {max(parsed.get('budget_split', {}).items(), key=lambda x: x[1], default=('N/A', 0))[0]} for highest ROI.",
                "Run A/B tests on headlines every 2 weeks.",
                "Retarget website visitors with lower-funnel creatives.",
            ],
            confidence_score=0.90,
        )
    except Exception as e:
        return AgentResult(
            agent_id="max_ads_campaign",
            coworker="max",
            status="failed",
            summary=f"Ads campaign agent failed: {str(e)}",
            confidence_score=0.0,
        )
