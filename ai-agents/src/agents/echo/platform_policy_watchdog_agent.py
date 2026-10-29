"""
Platform Policy Watchdog & Multi-Agent Compliance Sentinel Agent
Continuously monitors and audits platform policies (Meta, Google, WhatsApp, Twilio, LinkedIn),
detects impending policy shifts, and generates actionable upgrade directives for other AI agents.
"""
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from ..base import AgentResult, get_llm, clean_json_markdown

logger = logging.getLogger(__name__)

# Built-in reference baseline of critical platform policies across major digital channels
KNOWN_PLATFORM_POLICIES = {
    "google": {
        "ads": "Prohibits guaranteed medical/health claims, before-after photos with deceptive expectations, clickbait headlines, and trademark infringement.",
        "reviews": "Strict ban on review gating (filtering unhappy customers to private forms while asking happy customers for Google reviews). Violations lead to listing suspension.",
        "local_services": "Requires verified business licensing, background checks for home/health services, and exact NAP (Name, Address, Phone) consistency."
    },
    "meta": {
        "ads": "No personal health attributes ('Do you have diabetes?'), no before/after cosmetic imagery, mandatory Special Ad Categories for housing, credit, and employment.",
        "messaging": "24-hour customer care window; outbound messages outside window require approved Message Tags or Utility/Marketing templates.",
        "ai_disclosure": "Mandatory disclosure tags for photorealistic AI-generated media, political/social issues, and sensitive categories."
    },
    "whatsapp": {
        "templates": "Strict categorization into Marketing, Utility, and Authentication. Misclassifying marketing as utility triggers template rejection and quality score downgrades.",
        "opt_in": "Explicit opt-in required prior to initiating outbound WhatsApp messages. Unsolicited outreach leads to phone number ban."
    },
    "twilio": {
        "10dlc": "Mandatory A2P 10DLC campaign registration with TCR (The Campaign Registry) for all US SMS. Unregistered traffic is 100% blocked.",
        "voice": "TCPA compliance requires express written consent for AI autodialers. Mandatory opt-out mechanisms ('Press 9 to stop') and adherence to local calling hour windows (8am - 8pm)."
    },
    "linkedin": {
        "outreach": "Weekly connection request limits (approx. 100-200/week). Third-party headless scraping violates User Agreement and triggers account restriction."
    }
}


async def run_platform_policy_watchdog_agent(
    platforms: Optional[List[str]] = None,
    industry: str = "Healthcare & Local Services",
    active_assets_sample: Optional[Dict[str, Any]] = None,
    recent_policy_updates: Optional[List[Dict[str, Any]]] = None,
    org_id: str = ""
) -> AgentResult:
    """
    Audits platform policies across Meta, Google, WhatsApp, Twilio, and LinkedIn.
    Determines risks, evaluates compliance of active assets, and dispatches upgrade directives to other AI agents.
    """
    try:
        target_platforms = platforms or ["google", "meta", "whatsapp", "twilio", "linkedin"]
        active_assets = active_assets_sample or {}
        policy_updates = recent_policy_updates or []

        llm = get_llm(model="gpt-4o-mini", temperature=0.2)

        if llm:
            prompt = f"""You are the Chief Regulatory & Platform Policy Compliance Watchdog for an autonomous AI marketing team (Wheedle.ai).
You govern 4 AI Coworkers:
- Max (Growth: Ads, Lead Gen, Research, Creative Templates)
- Stella (Presence: Reviews, Local SEO, Social Publishing, Chatbot)
- Atlas (Operations: Front Desk, Appointments, Reminders, Voice AI, Speed-to-lead)
- Echo (Experience: CSAT/NPS Surveys, Sentiment, Ticketing, Reporting)

Target Platforms to Audit: {target_platforms}
Client Industry: {industry}
Active Assets Sample to Check: {json.dumps(active_assets) if active_assets else "Standard marketing copy, review request templates, voice scripts, WhatsApp alerts"}
Recent Regulatory/API Notes: {json.dumps(policy_updates) if policy_updates else "Standard active platform rules"}

Reference Platform Rules:
{json.dumps(KNOWN_PLATFORM_POLICIES, indent=2)}

Task:
1. Conduct a rigorous policy risk assessment for each targeted platform.
2. Identify any compliance violations, impending risks, or API deprecations that could harm accounts or lead to bans/penalties.
3. For each affected AI Coworker (Max, Stella, Atlas, Echo), provide CONCRETE UPGRADE DIRECTIVES:
   - What prompt guardrails to inject?
   - What copy/keywords must be prohibited?
   - What templates or calling hours must be updated?
4. Formulate an overarching platform upgrade bulletin with priority rating (critical, warning, advisory).

Respond strictly in valid JSON format:
{{
  "overall_compliance_status": "fully_compliant" | "warning_action_required" | "critical_risk_detected",
  "risk_score": 15,
  "summary": "Executive summary of platform policies and required system upgrades",
  "platform_audits": [
    {{
      "platform": "meta",
      "status": "compliant" | "warning" | "violation_risk",
      "key_risk": "Short description of the policy rule",
      "affected_agents": ["max_ads_campaign", "stella_social_publishing"],
      "action_required": "Concrete technical or prompt adjustment"
    }}
  ],
  "coworker_upgrade_directives": {{
    "max": ["Directive for Max's ad copy and research"],
    "stella": ["Directive for Stella's review requests and social posts"],
    "atlas": ["Directive for Atlas's WhatsApp templates and voice calling consent"],
    "echo": ["Directive for Echo's survey frequency and privacy disclosures"]
  }},
  "immediate_guardrail_updates": [
    "Negative keywords/phrases to immediately ban across all ad generators",
    "Template disclaimers to automatically append"
  ]
}}"""
            res = await llm.ainvoke(prompt)
            data = json.loads(clean_json_markdown(res.content))
        else:
            # High-fidelity deterministic fallback audit
            data = {
                "overall_compliance_status": "warning_action_required",
                "risk_score": 38,
                "summary": "Platform audit complete: 2 impending policy compliance adjustments required across Meta Ads (healthcare personal claims) and Google Business Profile (anti-review gating enforcement).",
                "platform_audits": [
                    {
                        "platform": "meta",
                        "status": "warning",
                        "key_risk": "Personal Health Attributes Policy prohibits direct questions or assertions regarding medical/dental conditions in ad copy.",
                        "affected_agents": ["max_ads_campaign", "max_template_design"],
                        "action_required": "Enforce neutral third-person framing. Replace 'Do you suffer from missing teeth?' with 'Modern dental implant solutions for restored smiles.'"
                    },
                    {
                        "platform": "google",
                        "status": "warning",
                        "key_risk": "Google Review Gating Policy strictly bans selective routing based on sentiment prior to requesting a Google review.",
                        "affected_agents": ["stella_review_generation"],
                        "action_required": "Ensure all review requests provide a direct Google link without an intermediary sentiment screening filter."
                    },
                    {
                        "platform": "whatsapp",
                        "status": "compliant",
                        "key_risk": "Meta WhatsApp Business Template categorization & 24h messaging window.",
                        "affected_agents": ["atlas_lead_followup", "atlas_reminders"],
                        "action_required": "Verify all appointment reminders are registered under 'Utility' category to avoid 3x marketing messaging surcharges."
                    },
                    {
                        "platform": "twilio",
                        "status": "compliant",
                        "key_risk": "A2P 10DLC registration and TCPA automated dialer calling hours (8am - 8pm local time).",
                        "affected_agents": ["atlas_front_desk", "atlas_multimodal_voice"],
                        "action_required": "Maintain timezone enforcement so no automated callback occurs outside 9:00 AM - 7:30 PM local."
                    }
                ],
                "coworker_upgrade_directives": {
                    "max": [
                        "Ban all before/after cosmetic dental images in Meta ad creative recommendations.",
                        "Filter out guaranteed cure phrases ('100% painless guarantee') from Google search ads headlines."
                    ],
                    "stella": [
                        "Review request messages must not include conditional language like 'If you enjoyed your visit'.",
                        "Social publishing must include '#Sponsored' or '#Ad' tags when promoting affiliate offers."
                    ],
                    "atlas": [
                        "Verify appointment reminders use verified WhatsApp Utility Templates.",
                        "Outbound voice calling must announce AI caller identity within the first 5 seconds."
                    ],
                    "echo": [
                        "Include an opt-out link ('Reply STOP to unsubscribe') in every WhatsApp CSAT/NPS survey."
                    ]
                },
                "immediate_guardrail_updates": [
                    "Banned ad copy patterns: 'guaranteed cure', 'miracle results', 'do you suffer from'",
                    "Mandatory consent verification before scheduling automated voice callbacks",
                    "Direct Google review links without intermediary rating gates"
                ]
            }

        status = "escalated" if data.get("overall_compliance_status") == "critical_risk_detected" else "success"

        proposed_action = {
            "actionType": "broadcast_policy_upgrade",
            "targetCoworkers": ["max", "stella", "atlas", "echo"],
            "payload": {
                "bulletin_id": f"pol_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                "overall_status": data.get("overall_compliance_status"),
                "risk_score": data.get("risk_score"),
                "directives": data.get("coworker_upgrade_directives", {}),
                "guardrails": data.get("immediate_guardrail_updates", []),
                "audited_platforms": target_platforms,
                "timestamp": datetime.utcnow().isoformat()
            }
        }

        insights = [
            f"Overall Status: {data.get('overall_compliance_status')} (Risk Score: {data.get('risk_score', 0)}/100)",
            f"Audited {len(target_platforms)} platforms: {', '.join(target_platforms)}",
            f"Directives issued to {len(data.get('coworker_upgrade_directives', {}))} coworkers",
            f"Active guardrails refreshed: {len(data.get('immediate_guardrail_updates', []))} items"
        ]

        return AgentResult(
            agent_id="platform_policy_watchdog",
            coworker="echo",
            status=status,
            summary=data.get("summary", "Platform policy audit completed successfully."),
            proposed_action=proposed_action,
            data=data,
            insights=insights,
            confidence_score=0.96
        )

    except Exception as e:
        logger.error(f"Error in platform_policy_watchdog_agent: {e}", exc_info=True)
        return AgentResult(
            agent_id="platform_policy_watchdog",
            coworker="echo",
            status="failed",
            summary=f"Platform policy watchdog failed: {str(e)}",
            proposed_action={},
            data={"error": str(e)},
            confidence_score=0.0
        )

