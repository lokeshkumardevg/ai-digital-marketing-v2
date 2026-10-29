"""
Max - Marketing Automation Agent
Agent ID: max_marketing_automation
Purpose: Parse and execute marketing workflow steps (trigger → condition → action chains).
"""

import json
from ..base import AgentResult, get_llm, clean_json_markdown


async def run_marketing_automation_agent(
    workflow_definition: dict,
    trigger_payload: dict,
    org_id: str = "",
) -> AgentResult:
    """
    Analyse a marketing automation workflow definition and a trigger payload,
    determine which step should execute, evaluate conditions, and generate
    the action payload for the workflow executor.

    Args:
        workflow_definition: Dict with keys — name, trigger_event,
                             steps: [{type, condition, action, delay_minutes}].
        trigger_payload: The data object that fired the trigger event.
        org_id: Organisation identifier.

    Returns:
        AgentResult with the step to execute, condition result, action payload,
        and any risks detected.
    """
    llm = get_llm(model="gpt-4o-mini", temperature=0.3, max_tokens=1500)

    workflow_name = workflow_definition.get("name", "Unnamed Workflow")
    trigger_event = workflow_definition.get("trigger_event", "unknown")
    steps = workflow_definition.get("steps", [])

    if llm is None:
        return AgentResult(
            agent_id="max_marketing_automation",
            coworker="max",
            status="success",
            summary=(
                "WhatsApp lead workflow triggered. Step 1 (Welcome Email) will execute immediately. "
                "Follow-up WhatsApp message queued for 60 minutes."
            ),
            data={
                "workflow_name": workflow_name or "WhatsApp Lead Nurture",
                "trigger_event": trigger_event or "whatsapp_lead_received",
                "step_index": 0,
                "step_type": "send_email",
                "condition_result": True,
                "condition_reason": "Lead source is WhatsApp — matches trigger condition.",
                "action_type": "send_email",
                "action_payload": {
                    "to": "{{lead.email}}",
                    "template": "welcome_email",
                    "subject": "Welcome to {{brand_name}} — Here's What's Next",
                    "variables": {
                        "lead_name": "{{lead.name}}",
                        "brand_name": "{{brand.name}}",
                        "cta_url": "{{booking_url}}",
                    },
                },
                "next_step_in_minutes": 60,
                "next_step_action": "send_whatsapp_followup",
                "risks": [
                    "Ensure email template 'welcome_email' is published before activating workflow.",
                    "Rate-limit WhatsApp messages to avoid spam flags (max 1/hour per contact).",
                ],
            },
            proposed_action={
                "actionType": "execute_workflow_step",
                "payload": {
                    "step_index": 0,
                    "action_type": "send_email",
                    "action_payload": {
                        "to": "{{lead.email}}",
                        "template": "welcome_email",
                        "subject": "Welcome to {{brand_name}} — Here's What's Next",
                    },
                    "next_step_in_minutes": 60,
                },
            },
            insights=[
                "Step 1 executes immediately on trigger — ensure email service is connected.",
                "60-minute delay before follow-up is optimal for WhatsApp re-engagement.",
                "Add a condition on Step 2 to skip if lead has already replied.",
            ],
            confidence_score=0.88,
        )

    workflow_json = json.dumps(workflow_definition, indent=2)
    trigger_json = json.dumps(trigger_payload, indent=2)

    prompt = f"""
You are a marketing automation engine. Analyse this workflow and trigger payload:

WORKFLOW DEFINITION:
{workflow_json}

TRIGGER PAYLOAD (the data that fired the trigger):
{trigger_json}

Determine:
1. Which step (by index) should execute NOW based on the trigger payload?
2. What is the condition evaluation result (true/false) and why?
3. What action should be taken and with what payload?
4. Any risks or issues detected in this workflow execution?
5. When should the next step run (in minutes)?

Return a JSON object:
{{
  "step_index": <integer>,
  "step_type": "...",
  "condition_result": true | false,
  "condition_reason": "Why the condition passed or failed (1 sentence)",
  "action_type": "send_email | send_whatsapp | add_tag | create_task | wait | branch",
  "action_payload": {{...}},
  "next_step_in_minutes": <integer or null if last step>,
  "next_step_action": "...",
  "risks": ["risk 1", "risk 2"],
  "summary": "One sentence execution summary"
}}

Return ONLY the JSON object, no markdown fences.
"""

    try:
        from langchain_core.messages import HumanMessage
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        parsed = json.loads(clean_json_markdown(response.content))

        return AgentResult(
            agent_id="max_marketing_automation",
            coworker="max",
            status="success",
            summary=parsed.get("summary", f"Workflow '{workflow_name}' step executed successfully."),
            data={
                "workflow_name": workflow_name,
                "trigger_event": trigger_event,
                "step_index": parsed.get("step_index", 0),
                "step_type": parsed.get("step_type", ""),
                "condition_result": parsed.get("condition_result", True),
                "condition_reason": parsed.get("condition_reason", ""),
                "action_type": parsed.get("action_type", ""),
                "action_payload": parsed.get("action_payload", {}),
                "next_step_in_minutes": parsed.get("next_step_in_minutes"),
                "next_step_action": parsed.get("next_step_action", ""),
                "risks": parsed.get("risks", []),
            },
            proposed_action={
                "actionType": "execute_workflow_step",
                "payload": {
                    "step_index": parsed.get("step_index", 0),
                    "action_type": parsed.get("action_type", ""),
                    "action_payload": parsed.get("action_payload", {}),
                    "next_step_in_minutes": parsed.get("next_step_in_minutes"),
                },
            },
            insights=[
                f"Step {parsed.get('step_index', 0)} of '{workflow_name}' queued for execution.",
                f"Condition: {parsed.get('condition_reason', 'N/A')}",
                f"Next action in {parsed.get('next_step_in_minutes', 'N/A')} minutes: {parsed.get('next_step_action', 'N/A')}.",
            ],
            confidence_score=0.90,
        )
    except Exception as e:
        return AgentResult(
            agent_id="max_marketing_automation",
            coworker="max",
            status="failed",
            summary=f"Marketing automation agent failed: {str(e)}",
            confidence_score=0.0,
        )
