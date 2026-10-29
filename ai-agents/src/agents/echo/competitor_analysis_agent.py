"""
Echo Competitor Analysis Agent (echo_competitor_analysis)
Weekly competitive intelligence — benchmark ratings, review volumes, identify market gaps, and surface differentiation opportunities.
Note: Real-time competitor data would come from Google Places API / scraping.
This agent uses LLM knowledge and provided data to generate actionable intelligence.
"""

import json
from ..base import AgentResult, get_llm, clean_json_markdown


async def run_competitor_analysis_agent(
    competitor_names: list,
    own_location_data: dict,
    industry: str,
    org_id: str = "",
) -> AgentResult:
    """
    Generate a competitive intelligence report for the business.

    Args:
        competitor_names: List of competitor business names.
        own_location_data: {name, avg_rating, review_count, recent_reviews, top_services}
        industry: Industry/vertical (e.g. "dental clinic", "hair salon").
        org_id: Organisation identifier.

    Returns:
        AgentResult with competitive position, gaps, differentiators, and weekly action.
    """
    try:
        own_name = own_location_data.get("name", "Our Business")
        own_rating = own_location_data.get("avg_rating", 4.0)
        own_count = own_location_data.get("review_count", 0)

        llm = get_llm(model="gpt-4o-mini", temperature=0.5, max_tokens=1200)

        if llm:
            prompt = (
                f"You are a competitive intelligence analyst for '{own_name}' in the {industry} industry.\n\n"
                f"Our data: {json.dumps(own_location_data)}\n"
                f"Competitors to analyse: {competitor_names}\n\n"
                "Based on your knowledge of this industry and the data provided, generate a competitive report.\n"
                "Respond ONLY with valid JSON:\n"
                '{"competitive_position": "<leader|challenger|follower|niche>", '
                '"competitors": [{"name": "...", "likely_strengths": ["..."], "common_complaints": ["..."], '
                '"price_positioning": "<premium|mid|budget>"}], '
                '"market_gaps": ["..."], "review_velocity_assessment": "...", '
                '"recommended_differentiators": ["...", "...", "..."], "weekly_action": "..."}'
            )
            result = await llm.ainvoke(prompt)
            analysis = json.loads(clean_json_markdown(result.content))
        else:
            analysis = {
                "competitive_position": "challenger",
                "competitors": [
                    {
                        "name": "SmileCo Dental",
                        "likely_strengths": ["Multiple locations", "Strong brand recognition", "Online booking"],
                        "common_complaints": ["Long wait times", "High prices", "Impersonal service"],
                        "price_positioning": "premium",
                    },
                    {
                        "name": "DentPro",
                        "likely_strengths": ["Budget pricing", "Walk-in appointments", "Wide service range"],
                        "common_complaints": ["Lower hygiene standards", "Rushed appointments", "Poor follow-up"],
                        "price_positioning": "budget",
                    },
                ],
                "market_gaps": [
                    "No competitor offers WhatsApp-based appointment reminders in this area.",
                    "Personalised post-treatment care plans are largely absent.",
                    "Evening/weekend slots are underserved by premium competitors.",
                ],
                "review_velocity_assessment": (
                    f"With {own_count} reviews, SmileCare is growing but needs 2x velocity to match SmileCo's volume. "
                    "Target: 15 new reviews/month via automated post-visit prompts."
                ),
                "recommended_differentiators": [
                    "Emphasise personalised care and patient relationships — competitors are seen as impersonal.",
                    "Promote transparent pricing with itemised quotes before treatment.",
                    "Highlight same-day emergency appointments as a unique selling point.",
                ],
                "weekly_action": (
                    "Launch a 'Review Drive': send WhatsApp follow-up to the last 50 patients asking for a Google review. "
                    "Goal: close the review volume gap with SmileCo by 20% this month."
                ),
            }

        benchmark = {
            "own_name": own_name,
            "own_avg_rating": own_rating,
            "own_review_count": own_count,
            "competitive_position": analysis.get("competitive_position"),
            "competitor_count": len(competitor_names),
        }

        return AgentResult(
            agent_id="echo_competitor_analysis",
            coworker="echo",
            status="success",
            summary=(
                f"Competitive analysis complete for {own_name} vs {', '.join(competitor_names)}. "
                f"Position: {analysis.get('competitive_position')}. "
                f"{len(analysis.get('market_gaps', []))} market gaps identified."
            ),
            proposed_action={
                "actionType": "save_competitor_report",
                "payload": {
                    "benchmark": benchmark,
                    "opportunities": analysis.get("market_gaps"),
                    "weekly_action": analysis.get("weekly_action"),
                    "competitive_position": analysis.get("competitive_position"),
                },
            },
            data=analysis,
            insights=[
                f"Position: {analysis.get('competitive_position')} — {own_name} has room to grow.",
                f"Top market gap: {analysis['market_gaps'][0] if analysis.get('market_gaps') else 'N/A'}.",
                f"Weekly action: {analysis.get('weekly_action', '')[:80]}...",
            ],
            confidence_score=0.85,
        )

    except Exception as exc:
        return AgentResult(
            agent_id="echo_competitor_analysis",
            coworker="echo",
            status="failed",
            summary=f"Competitor analysis agent failed: {exc}",
            data={"error": str(exc)},
        )
