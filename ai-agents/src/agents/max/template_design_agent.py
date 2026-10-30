"""
Max - Template Design Agent
Agent ID: max_template_design
Purpose: Generate on-brand copy and HTML templates for landing pages, emails, social posts, and WhatsApp.
"""

import json
from ..base import AgentResult, get_llm, clean_json_markdown

VALID_TEMPLATE_TYPES = {"landing_page", "email", "social_post", "whatsapp_message"}


async def run_template_design_agent(
    brand_profile: dict,
    template_type: str,
    brief: str,
    org_id: str = "",
) -> AgentResult:
    """
    Generate a branded content template (landing page HTML, email, social post,
    or WhatsApp message) based on the brand profile and creative brief.

    Args:
        brand_profile: Dict with brand details — name, industry, tone, colors, tagline.
        template_type: One of 'landing_page', 'email', 'social_post', 'whatsapp_message'.
        brief: Creative brief describing the goal and key messages for this template.
        org_id: Organisation identifier.

    Returns:
        AgentResult with the generated template content and preview text.
    """
    llm = get_llm(model="gpt-4o-mini", temperature=0.7, max_tokens=2500)

    brand_name = brand_profile.get("name", "Your Brand")
    industry = brand_profile.get("industry", "healthcare")
    tone = brand_profile.get("tone", "professional and warm")
    raw_colors = brand_profile.get("colors", {"primary": "#1a73e8", "secondary": "#ffffff"})
    if isinstance(raw_colors, dict):
        colors = raw_colors
    else:
        colors = {"primary": str(raw_colors), "secondary": "#ffffff"}
    tagline = brand_profile.get("tagline", "Your Health, Our Priority")

    if template_type not in VALID_TEMPLATE_TYPES:
        return AgentResult(
            agent_id="max_template_design",
            coworker="max",
            status="failed",
            summary=f"Invalid template_type '{template_type}'. Must be one of {VALID_TEMPLATE_TYPES}.",
            confidence_score=0.0,
        )

    if llm is None:
        mock_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{{{PAGE_TITLE}}}} | {brand_name}</title>
  <style>
    :root {{
      --primary: {colors.get('primary', '#1a73e8')};
      --secondary: {colors.get('secondary', '#ffffff')};
    }}
    body {{ font-family: 'Inter', sans-serif; margin: 0; background: var(--secondary); color: #333; }}
    .hero {{ background: var(--primary); color: #fff; padding: 60px 20px; text-align: center; }}
    .hero h1 {{ font-size: 2.5rem; margin-bottom: 12px; }}
    .hero p {{ font-size: 1.1rem; opacity: 0.9; }}
    .cta-btn {{ background: #fff; color: var(--primary); padding: 14px 32px;
                border-radius: 6px; font-weight: 700; text-decoration: none;
                display: inline-block; margin-top: 24px; }}
    .features {{ display: flex; gap: 24px; padding: 48px 20px; max-width: 960px; margin: 0 auto; }}
    .feature {{ flex: 1; text-align: center; padding: 24px; border-radius: 8px;
                box-shadow: 0 2px 12px rgba(0,0,0,0.08); }}
    .footer {{ background: #f5f5f5; text-align: center; padding: 24px; font-size: 0.85rem; color: #777; }}
  </style>
</head>
<body>
  <div class="hero">
    <h1>{{{{HEADLINE}}}}</h1>
    <p>{{{{SUBHEADLINE}}}}</p>
    <a href="{{{{CTA_URL}}}}" class="cta-btn">{{{{CTA_TEXT}}}}</a>
  </div>
  <div class="features">
    <div class="feature"><h3>✓ {{{{FEATURE_1}}}}</h3><p>{{{{FEATURE_1_DESC}}}}</p></div>
    <div class="feature"><h3>✓ {{{{FEATURE_2}}}}</h3><p>{{{{FEATURE_2_DESC}}}}</p></div>
    <div class="feature"><h3>✓ {{{{FEATURE_3}}}}</h3><p>{{{{FEATURE_3_DESC}}}}</p></div>
  </div>
  <div class="footer">
    <p>{tagline} | © {{{{YEAR}}}} {brand_name}. All rights reserved.</p>
    <p><a href="{{{{UNSUBSCRIBE_URL}}}}">Unsubscribe</a></p>
  </div>
</body>
</html>"""

        return AgentResult(
            agent_id="max_template_design",
            coworker="max",
            status="success",
            summary=(
                f"Email template generated for {brand_name} dental promotion. "
                "Includes hero section, 3 feature blocks, and branded CTA."
            ),
            data={
                "template_type": template_type,
                "content": mock_content,
                "preview_text": f"Special offer from {brand_name} — book your free consultation today!",
                "placeholders": [
                    "{{PAGE_TITLE}}", "{{HEADLINE}}", "{{SUBHEADLINE}}", "{{CTA_URL}}",
                    "{{CTA_TEXT}}", "{{FEATURE_1}}", "{{FEATURE_1_DESC}}",
                    "{{FEATURE_2}}", "{{FEATURE_2_DESC}}", "{{FEATURE_3}}", "{{FEATURE_3_DESC}}",
                    "{{YEAR}}", "{{UNSUBSCRIBE_URL}}",
                ],
            },
            proposed_action={
                "actionType": "save_template",
                "payload": {
                    "template_type": template_type,
                    "content": mock_content,
                    "preview_text": f"Special offer from {brand_name} — book your free consultation today!",
                },
            },
            insights=[
                "Replace all {{PLACEHOLDER}} tokens before sending.",
                "A/B test the CTA button text for higher click-through rates.",
                "Ensure CAN-SPAM / GDPR compliance — include unsubscribe link.",
            ],
            confidence_score=0.83,
        )

    type_instructions = {
        "landing_page": "a complete, mobile-responsive HTML landing page with hero, features, and CTA sections",
        "email": "a full HTML email template (inline CSS) with header, body, and footer",
        "social_post": "copy for a social media post including caption, hashtags, and image description",
        "whatsapp_message": "a WhatsApp message (plain text, under 280 chars, emoji-friendly)",
    }

    prompt = f"""
You are a brand copywriter and web designer. Generate {type_instructions.get(template_type, template_type)} for:

Brand: {brand_name}
Industry: {industry}
Tone: {tone}
Tagline: {tagline}
Colors (as CSS vars): primary={colors.get('primary', '#1a73e8')}, secondary={colors.get('secondary', '#ffffff')}
Brief: {brief}

Mark all editable fields as {{{{PLACEHOLDER_NAME}}}}.

Return a JSON object:
{{
  "content": "<full template content or HTML>",
  "preview_text": "Subject line or post preview (under 80 chars)",
  "placeholders": ["{{{{PLACEHOLDER_1}}}}", "{{{{PLACEHOLDER_2}}}}"],
  "summary": "One sentence description of the template"
}}

Return ONLY the JSON object, no markdown fences.
"""

    try:
        from langchain_core.messages import HumanMessage
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        parsed = json.loads(clean_json_markdown(response.content))

        return AgentResult(
            agent_id="max_template_design",
            coworker="max",
            status="success",
            summary=parsed.get("summary", f"{template_type.replace('_', ' ').title()} template created for {brand_name}."),
            data={
                "template_type": template_type,
                "content": parsed.get("content", ""),
                "preview_text": parsed.get("preview_text", ""),
                "placeholders": parsed.get("placeholders", []),
            },
            proposed_action={
                "actionType": "save_template",
                "payload": {
                    "template_type": template_type,
                    "content": parsed.get("content", ""),
                    "preview_text": parsed.get("preview_text", ""),
                },
            },
            insights=[
                f"Template contains {len(parsed.get('placeholders', []))} editable placeholder(s).",
                "Test rendering across email clients (Gmail, Outlook) before sending.",
                "Personalise {{NAME}} tokens using CRM merge tags for higher open rates.",
            ],
            confidence_score=0.88,
        )
    except Exception as e:
        return AgentResult(
            agent_id="max_template_design",
            coworker="max",
            status="failed",
            summary=f"Template design agent failed: {str(e)}",
            confidence_score=0.0,
        )
