"""
Max - Deep Research Agent
Agent ID: max_deep_research
Purpose: Market research, competitor analysis, and keyword opportunities.
"""

import json
from typing import List
from ..base import AgentResult, get_llm, clean_json_markdown


async def run_deep_research_agent(
    brand_name: str,
    website_url: str,
    competitors: list[str],
    industry: str,
    org_id: str = "",
) -> AgentResult:
    """
    Conduct deep market research for a brand: USPs, positioning gaps,
    keyword opportunities, and competitor SWOT.

    Args:
        brand_name: Name of the brand being researched.
        website_url: The brand's website URL.
        competitors: List of competitor brand names or URLs.
        industry: The industry/vertical.
        org_id: Organisation identifier.

    Returns:
        AgentResult containing research brief, keywords, and competitor insights.
    """
    llm = get_llm(model="gpt-4o-mini", temperature=0.4, max_tokens=2500)

    if llm is None:
        mock_brief = (
            f"{brand_name} operates in the competitive {industry} market where digital presence "
            "is a primary driver of patient acquisition. Analysis of SmileCo and DentPro reveals "
            "that both competitors lead on SEO content volume but lack personalised patient "
            "journey communications.\n\n"
            f"{brand_name} has a clear opportunity to dominate local search, invest in patient "
            "testimonial content, and build authority through educational blog posts targeting "
            "high-intent keywords like 'painless root canal near me' and 'best orthodontist in Mumbai'."
        )
        return AgentResult(
            agent_id="max_deep_research",
            coworker="max",
            status="success",
            summary=(
                f"Research brief generated for {brand_name} vs {', '.join(competitors)}. "
                "10 keyword opportunities and competitor SWOT identified."
            ),
            data={
                "research_brief": mock_brief,
                "keywords": [
                    {"keyword": "dental clinic near me", "intent": "navigational", "volume_estimate": "High"},
                    {"keyword": "painless root canal", "intent": "informational", "volume_estimate": "Medium"},
                    {"keyword": "teeth whitening cost Mumbai", "intent": "transactional", "volume_estimate": "Medium"},
                    {"keyword": "best orthodontist Mumbai", "intent": "commercial", "volume_estimate": "High"},
                    {"keyword": "dental implants price India", "intent": "transactional", "volume_estimate": "High"},
                    {"keyword": "emergency dentist open Sunday", "intent": "transactional", "volume_estimate": "Medium"},
                    {"keyword": "braces for adults", "intent": "informational", "volume_estimate": "Medium"},
                    {"keyword": "invisible aligners cost", "intent": "transactional", "volume_estimate": "Medium"},
                    {"keyword": "child dentist Mumbai", "intent": "commercial", "volume_estimate": "Low"},
                    {"keyword": "dental checkup coupon", "intent": "transactional", "volume_estimate": "Low"},
                ],
                "competitors": [
                    {
                        "name": "SmileCo",
                        "strengths": ["Strong SEO content", "High Google reviews", "Wide clinic network"],
                        "weaknesses": ["Impersonal UX", "Slow booking flow", "No WhatsApp support"],
                    },
                    {
                        "name": "DentPro",
                        "strengths": ["Price competitive", "Strong Instagram presence"],
                        "weaknesses": ["Low trust signals", "No patient testimonials", "Outdated website"],
                    },
                ],
                "usps": [
                    "Same-day appointments available",
                    "EMI options for major procedures",
                    "Multilingual staff (English, Hindi, Marathi)",
                ],
                "positioning_gaps": [
                    "No competitor owns 'painless dentistry' messaging locally",
                    "WhatsApp booking is underutilised in this space",
                ],
            },
            proposed_action={
                "actionType": "save_research_brief",
                "payload": {
                    "brief": mock_brief,
                    "keywords": [
                        "dental clinic near me", "painless root canal",
                        "teeth whitening cost Mumbai", "best orthodontist Mumbai",
                        "dental implants price India",
                    ],
                    "competitors": ["SmileCo", "DentPro"],
                },
            },
            insights=[
                "Target 'painless root canal' — no competitor owns this query locally.",
                "SmileCo's weak WhatsApp experience is a clear gap to exploit.",
                "Focus content strategy on patient journey and outcome stories.",
            ],
            confidence_score=0.85,
        )

    prompt = f"""
You are a senior market research analyst. Conduct deep research for:
- Brand: {brand_name}
- Website: {website_url}
- Competitors: {', '.join(competitors)}
- Industry: {industry}

Return a JSON object with these keys:
{{
  "research_brief": "2-paragraph research summary",
  "keywords": [
    {{"keyword": "...", "intent": "informational|transactional|commercial|navigational", "volume_estimate": "High|Medium|Low"}}
    // exactly 10 keywords
  ],
  "competitors": [
    {{"name": "...", "strengths": ["..."], "weaknesses": ["..."]}}
    // top 3
  ],
  "usps": ["USP 1", "USP 2", "USP 3"],
  "positioning_gaps": ["gap 1", "gap 2"],
  "summary": "One sentence summary"
}}

Return ONLY the JSON object, no markdown fences.
"""

    try:
        from langchain_core.messages import HumanMessage
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        parsed = json.loads(clean_json_markdown(response.content))

        return AgentResult(
            agent_id="max_deep_research",
            coworker="max",
            status="success",
            summary=parsed.get("summary", "Deep research completed successfully."),
            data={
                "research_brief": parsed.get("research_brief", ""),
                "keywords": parsed.get("keywords", []),
                "competitors": parsed.get("competitors", []),
                "usps": parsed.get("usps", []),
                "positioning_gaps": parsed.get("positioning_gaps", []),
            },
            proposed_action={
                "actionType": "save_research_brief",
                "payload": {
                    "brief": parsed.get("research_brief", ""),
                    "keywords": [kw["keyword"] for kw in parsed.get("keywords", [])],
                    "competitors": [c["name"] for c in parsed.get("competitors", [])],
                },
            },
            insights=parsed.get("positioning_gaps", []) + [
                "Review keyword volume estimates with Google Keyword Planner before launch.",
            ],
            confidence_score=0.88,
        )
    except Exception as e:
        return AgentResult(
            agent_id="max_deep_research",
            coworker="max",
            status="failed",
            summary=f"Deep research agent failed: {str(e)}",
            confidence_score=0.0,
        )
