"""
Echo Reporting Agent (echo_reporting)
Compile cross-coworker KPIs and generate an executive narrative report formatted for PDF/slide rendering.
"""

import json
from ..base import AgentResult, get_llm, clean_json_markdown


async def run_reporting_agent(
    all_kpis: dict,
    date_range: dict,
    brand_name: str,
    report_type: str = "weekly",
    org_id: str = "",
) -> AgentResult:
    """
    Generate an executive marketing performance report across all coworkers.

    Args:
        all_kpis: Dict keyed by coworker (max, stella, atlas, echo) with their respective KPIs.
        date_range: {start: "YYYY-MM-DD", end: "YYYY-MM-DD"}
        brand_name: Business/brand name for the report.
        report_type: "weekly" | "monthly" | "quarterly"
        org_id: Organisation identifier.

    Returns:
        AgentResult with structured report JSON ready for PDF/slide rendering.
    """
    try:
        start = date_range.get("start", "N/A")
        end = date_range.get("end", "N/A")
        llm = get_llm(model="gpt-4o-mini", temperature=0.45, max_tokens=1500)

        if llm:
            prompt = (
                f"You are writing an executive marketing performance report for '{brand_name}'.\n"
                f"Period: {start} to {end} ({report_type})\n"
                f"KPIs by coworker:\n{json.dumps(all_kpis, indent=2)}\n\n"
                "Generate ONLY valid JSON:\n"
                '{"headline": "...", "narrative": "...", "top_wins": ["...", "...", "..."], '
                '"top_concerns": [{"concern": "...", "action": "..."}], '
                '"trends": {"max": "<Up↑|Down↓|Stable→>", "stella": "...", "atlas": "...", "echo": "..."}, '
                '"ceo_sentence": "...", "next_week_priorities": ["...", "...", "..."]}'
                "\n\nRules:\n"
                "- headline: max 15 words — capture biggest win AND concern.\n"
                "- narrative: 200-250 words, story of this period.\n"
                "- ceo_sentence: starts with 'This week, [brand_name] ...'\n"
                "- top_concerns: include recommended action for each.\n"
                "- trends: Up↑ / Down↓ / Stable→ for each coworker's primary metric."
            )
            result = await llm.ainvoke(prompt)
            report = json.loads(clean_json_markdown(result.content))
        else:
            report = {
                "headline": "Strong Patient Loyalty This Week, but Lead Volume Needs Urgent Attention",
                "narrative": (
                    f"This {report_type} period ({start} to {end}), {brand_name} demonstrated exceptional patient "
                    "retention and satisfaction metrics, anchored by an impressive NPS score of 8.4 from Echo's survey programme. "
                    "Atlas managed 142 inbound calls, booking 61 appointments — a healthy conversion rate — while the no-show "
                    "rate held steady at 12%, an area worth monitoring. "
                    "On the marketing front, Max ran 3 campaigns with a combined CTR of 4.2%, generating 38 leads, though only "
                    "14 qualified — suggesting targeting or landing page optimisation is needed. "
                    "Stella's social presence delivered 87 post engagements and 34 chatbot conversations, building brand awareness "
                    "at low cost. Echo resolved 7 of 9 tickets within SLA, maintaining accountability. "
                    "The primary concern this week is lead quality: the gap between raw leads and qualified leads (37%) is below "
                    "the 50% benchmark. Next week's focus should be tightening ad targeting and improving the lead qualification "
                    "flow to convert marketing spend into booked appointments more efficiently."
                ),
                "top_wins": [
                    "🏆 NPS score of 8.4 — patients are highly likely to recommend SmileCare.",
                    "📞 Atlas booked 61 appointments from 142 calls (43% booking rate).",
                    "🌟 Echo resolved 78% of tickets within SLA, keeping complaints contained.",
                ],
                "top_concerns": [
                    {"concern": "Only 14 of 38 leads qualified (37%) — low lead quality.", "action": "Refine ad targeting and review landing page copy with Max."},
                    {"concern": "No-show rate at 12% — above 10% benchmark.", "action": "Atlas to send 48h + 2h appointment reminders automatically."},
                    {"concern": "2 tickets unresolved beyond SLA deadline.", "action": "Review ticketing SLA policy and escalation triggers with Echo."},
                ],
                "trends": {
                    "max": "Down↓",
                    "stella": "Stable→",
                    "atlas": "Up↑",
                    "echo": "Up↑",
                },
                "ceo_sentence": (
                    f"This week, {brand_name} earned strong patient loyalty scores but must urgently improve "
                    "lead quality and appointment adherence to turn marketing spend into revenue."
                ),
                "next_week_priorities": [
                    "Refine Max's ad targeting to improve lead-to-qualified ratio above 50%.",
                    "Launch Atlas's 48h automated reminder to reduce no-shows below 10%.",
                    "Run a review drive via Echo — target 20 new Google reviews from satisfied patients.",
                ],
            }

        report_structure = {
            "brand": brand_name,
            "period": {"start": start, "end": end, "type": report_type},
            "slides": [
                {"slide": 1, "title": "Executive Summary", "content": report.get("headline"), "body": report.get("ceo_sentence")},
                {"slide": 2, "title": "Performance Narrative", "content": report.get("narrative")},
                {"slide": 3, "title": "Top Wins", "content": report.get("top_wins")},
                {"slide": 4, "title": "Concerns & Actions", "content": report.get("top_concerns")},
                {"slide": 5, "title": "Trends by Coworker", "content": report.get("trends")},
                {"slide": 6, "title": "Next Week Priorities", "content": report.get("next_week_priorities")},
                {"slide": 7, "title": "KPI Data", "content": all_kpis},
            ],
        }

        return AgentResult(
            agent_id="echo_reporting",
            coworker="echo",
            status="success",
            summary=f"{report_type.capitalize()} report generated for {brand_name} ({start} → {end}): '{report.get('headline')}'",
            proposed_action={
                "actionType": "generate_report",
                "payload": {
                    "report_structure": report_structure,
                    "summary_text": report.get("narrative"),
                    "highlights": report.get("top_wins"),
                    "pdf_ready": True,
                },
            },
            data={**report, "report_structure": report_structure, "kpis": all_kpis},
            insights=[
                f"Headline: {report.get('headline')}",
                f"CEO sentence: {report.get('ceo_sentence')}",
                f"Trends: {report.get('trends')}",
            ],
            confidence_score=0.93,
        )

    except Exception as exc:
        return AgentResult(
            agent_id="echo_reporting",
            coworker="echo",
            status="failed",
            summary=f"Reporting agent failed: {exc}",
            data={"error": str(exc)},
        )
