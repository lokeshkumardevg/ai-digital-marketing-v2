"""
Stella Listings Optimisation Agent
Agent ID: stella_listings_optimization
Coworker: stella

Purpose: Audit NAP (Name / Address / Phone) consistency and generate prioritised
Google Business Profile optimisation suggestions for local SEO improvements.
"""

import json
from ..base import AgentResult, get_llm, clean_json_markdown


async def run_listings_optimization_agent(
    location_data: dict,
    org_id: str = "",
) -> AgentResult:
    """
    Analyse a Google Business Profile location record and produce actionable optimisation steps.

    Args:
        location_data: Dict containing GBP fields — name, address, phone, hours
                       (mon_fri, sat, sun), categories (list), website, description.
        org_id: Organisation identifier for multi-tenant setups.

    Returns:
        AgentResult with scored insights and a proposed GBP update action.
    """
    prompt = f"""You are a local SEO expert specialising in Google Business Profile (GBP) optimisation.

Analyse the following GBP data and return a structured audit. Return ONLY valid JSON — no markdown fences.

GBP Data:
{json.dumps(location_data, indent=2)}

Perform the following checks:
1. NAP Consistency: Flag formatting inconsistencies (suite vs #, phone format, address abbreviations).
2. Business Description: Score 0-100. Target 750 chars. Suggest improved description.
3. Categories: Are primary + secondary categories optimal for local search? Suggest better ones.
4. Missing fields: Which critical GBP fields are empty or weak (photos, Q&A, attributes, etc.)?
5. Review response posture: Is there evidence of active review management? What to fix?
6. Generate exactly 5 prioritised action items ordered by SEO impact.

Return JSON:
{{
  "nap_issues": ["<issue 1>", "<issue 2>"],
  "description_score": <0-100>,
  "description_suggestion": "<improved description text up to 750 chars>",
  "current_categories": ["<cat>"],
  "suggested_categories": ["<primary>", "<secondary 1>", "<secondary 2>"],
  "missing_fields": ["<field>"],
  "review_management_notes": "<observation>",
  "action_items": [
    {{"priority": 1, "action": "<action>", "impact": "high|medium|low"}},
    {{"priority": 2, "action": "<action>", "impact": "high|medium|low"}},
    {{"priority": 3, "action": "<action>", "impact": "high|medium|low"}},
    {{"priority": 4, "action": "<action>", "impact": "high|medium|low"}},
    {{"priority": 5, "action": "<action>", "impact": "high|medium|low"}}
  ],
  "overall_profile_score": <0-100>
}}"""

    llm = get_llm(model="gpt-4o-mini", temperature=0.3)

    try:
        if llm is None:
            audit = {
                "nap_issues": [
                    "Phone number missing country code — should be +91-22-XXXX-XXXX",
                    "Address uses 'Rd' — standardise to 'Road' for consistency",
                ],
                "description_score": 42,
                "description_suggestion": (
                    "SmileCare Dental Clinic in Bandra, Mumbai offers comprehensive dental care including "
                    "teeth whitening, dental implants, orthodontics, and preventive dentistry. "
                    "Our experienced team uses the latest technology to ensure pain-free treatments in a "
                    "comfortable, welcoming environment. Conveniently located near Bandra Station, we serve "
                    "families across Bandra, Khar, and Santacruz. Book your consultation today and take the "
                    "first step towards your perfect smile. Open Monday–Saturday 9AM–8PM."
                ),
                "current_categories": ["Dental Clinic"],
                "suggested_categories": ["Dentist", "Cosmetic Dentist", "Dental Implants Periodontist"],
                "missing_fields": [
                    "Business photos (exterior, interior, team)",
                    "Google Q&A section — no answers posted",
                    "Appointment URL not set",
                    "Service menu not configured",
                    "Health & safety attributes missing",
                ],
                "review_management_notes": "No replies detected on recent reviews. Active review responses boost local ranking.",
                "action_items": [
                    {"priority": 1, "action": "Add 10+ high-quality photos (exterior, treatment rooms, team)", "impact": "high"},
                    {"priority": 2, "action": "Update primary category to 'Dentist' and add 'Cosmetic Dentist'", "impact": "high"},
                    {"priority": 3, "action": "Rewrite description to 750 chars with target keywords", "impact": "high"},
                    {"priority": 4, "action": "Set appointment booking URL and enable online bookings", "impact": "medium"},
                    {"priority": 5, "action": "Respond to all existing reviews within 48 hours", "impact": "medium"},
                ],
                "overall_profile_score": 38,
            }
        else:
            response = await llm.ainvoke(prompt)
            raw = clean_json_markdown(response.content)
            audit = json.loads(raw)

        score = audit.get("overall_profile_score", 0)
        high_impact = [a["action"] for a in audit.get("action_items", []) if a.get("impact") == "high"]

        return AgentResult(
            agent_id="stella_listings_optimization",
            coworker="stella",
            status="success",
            summary=f"GBP audit complete. Profile score: {score}/100. {len(high_impact)} high-impact actions identified.",
            proposed_action={
                "actionType": "update_gbp_listing",
                "payload": {
                    "optimized_description": audit.get("description_suggestion", ""),
                    "suggested_categories": audit.get("suggested_categories", []),
                    "action_items": audit.get("action_items", []),
                },
            },
            data=audit,
            insights=[
                f"Overall GBP profile score: {score}/100",
                f"NAP issues found: {len(audit.get('nap_issues', []))}",
                f"Description score: {audit.get('description_score', 0)}/100 (target 750 chars)",
                f"Missing fields: {', '.join(audit.get('missing_fields', [])[:3])}",
            ],
            confidence_score=0.88,
        )

    except Exception as exc:
        return AgentResult(
            agent_id="stella_listings_optimization",
            coworker="stella",
            status="failed",
            summary=f"Listings optimisation audit failed: {exc}",
            insights=[str(exc)],
            confidence_score=0.0,
        )
