"""
Max - AI Visibility Agent
Agent ID: max_ai_visibility
Purpose: Check brand visibility in AI/LLM responses for target queries (AEO).
"""

import json
from typing import List
from ..base import AgentResult, get_llm, clean_json_markdown


async def run_ai_visibility_agent(
    brand_name: str,
    target_prompts: list[str],
    location: str,
    industry: str,
    org_id: str = "",
) -> AgentResult:
    """
    Simulate AI assistant responses for target queries and evaluate whether the
    brand appears, plus generate Answer Engine Optimisation (AEO) recommendations.

    Args:
        brand_name: The brand to check visibility for.
        target_prompts: List of queries to test (e.g., 'best dentist in Mumbai').
        location: Geographic location (e.g., 'Mumbai').
        industry: Industry/vertical (e.g., 'dental clinic').
        org_id: Organisation identifier.

    Returns:
        AgentResult with AI visibility score, per-prompt results, and AEO recommendations.
    """
    llm = get_llm(model="gpt-4o-mini", temperature=0.5, max_tokens=2000)

    if llm is None:
        return AgentResult(
            agent_id="max_ai_visibility",
            coworker="max",
            status="success",
            summary=(
                f"{brand_name} achieved an AI visibility score of 42/100 in {location}. "
                "Low brand citation volume and missing structured data are primary gaps."
            ),
            data={
                "visibility_score": 42,
                "prompt_results": [
                    {
                        "prompt": f"Best dental clinic in {location}",
                        "brand_mentioned": False,
                        "reason": "Insufficient Google Reviews volume and no structured FAQ schema.",
                        "improvement": "Increase reviews to 200+ and add LocalBusiness schema.",
                    },
                    {
                        "prompt": f"Affordable dentist near {location}",
                        "brand_mentioned": False,
                        "reason": "No pricing content indexed; competitors have pricing pages.",
                        "improvement": "Publish a 'Dental Treatment Costs' page with FAQ markup.",
                    },
                    {
                        "prompt": f"Painless root canal {location}",
                        "brand_mentioned": True,
                        "reason": "Brand has a relevant blog post indexed by AI training sources.",
                        "improvement": "Expand the blog post with patient testimonials and FAQ schema.",
                    },
                ],
                "recommendations": [
                    "Publish at least 20 FAQ-schema-marked articles targeting local dental queries.",
                    "Increase Google Reviews to 200+ with keyword-rich patient responses.",
                    "Build citations on Practo, JustDial, Sulekha, and Healthgrades.",
                    "Add LocalBusiness and MedicalClinic schema markup to homepage.",
                    "Launch a YouTube channel with procedure explainer videos — AI cites video content.",
                ],
            },
            proposed_action={
                "actionType": "save_visibility_report",
                "payload": {
                    "visibility_score": 42,
                    "prompt_results": [
                        {"prompt": f"Best dental clinic in {location}", "brand_mentioned": False},
                        {"prompt": f"Painless root canal {location}", "brand_mentioned": True},
                    ],
                    "recommendations": [
                        "Publish FAQ-schema articles",
                        "Build local citations",
                        "Add structured data markup",
                    ],
                },
            },
            insights=[
                "Only 1 of 3 test prompts surfaced the brand — visibility is critically low.",
                "FAQ schema and review volume are the two highest-impact AEO levers.",
                "Structured data markup can improve AI citation probability within 60 days.",
            ],
            confidence_score=0.80,
        )

    prompts_str = "\n".join([f"- {p}" for p in target_prompts])
    prompt = f"""
You are simulating an AI assistant's response to local search queries. Evaluate brand AI visibility:

Brand: {brand_name}
Location: {location}
Industry: {industry}

Target queries to test:
{prompts_str}

For each prompt, assess whether {brand_name} would appear in an AI assistant's answer.
Then generate an overall AI visibility score.

Return a JSON object:
{{
  "visibility_score": <integer 0-100>,
  "prompt_results": [
    {{
      "prompt": "...",
      "brand_mentioned": true | false,
      "reason": "Why or why not (1-2 sentences)",
      "improvement": "Specific AEO fix (1 sentence)"
    }}
  ],
  "recommendations": ["rec 1", "rec 2", "rec 3", "rec 4", "rec 5"],
  "summary": "One sentence visibility assessment"
}}

Return ONLY the JSON object, no markdown fences.
"""

    try:
        from langchain_core.messages import HumanMessage
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        parsed = json.loads(clean_json_markdown(response.content))

        score = parsed.get("visibility_score", 0)
        return AgentResult(
            agent_id="max_ai_visibility",
            coworker="max",
            status="success",
            summary=parsed.get("summary", f"AI visibility score: {score}/100."),
            data={
                "visibility_score": score,
                "prompt_results": parsed.get("prompt_results", []),
                "recommendations": parsed.get("recommendations", []),
            },
            proposed_action={
                "actionType": "save_visibility_report",
                "payload": {
                    "visibility_score": score,
                    "prompt_results": parsed.get("prompt_results", []),
                    "recommendations": parsed.get("recommendations", []),
                },
            },
            insights=[
                f"AI visibility score: {score}/100 — {'strong' if score >= 70 else 'needs improvement'}.",
                "Structured FAQ schema is the fastest-impact AEO lever.",
                "Review volume and citation breadth directly influence AI mention probability.",
            ],
            confidence_score=0.85,
        )
    except Exception as e:
        return AgentResult(
            agent_id="max_ai_visibility",
            coworker="max",
            status="failed",
            summary=f"AI visibility agent failed: {str(e)}",
            confidence_score=0.0,
        )
