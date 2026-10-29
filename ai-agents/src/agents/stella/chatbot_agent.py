"""
Chatbot Agent - Grounded Q&A from knowledge base, lead capture detection, human handoff detection
"""
import json
import logging
from typing import Dict, Any, List
from ..base import AgentResult, get_llm, clean_json_markdown

logger = logging.getLogger(__name__)

async def run_chatbot_agent(
    user_message: str,
    conversation_history: List[Dict[str, str]],
    knowledge_base: List[Dict[str, Any]],
    brand_name: str,
    org_id: str = ""
) -> AgentResult:
    """
    Evaluates customer messages against brand knowledge base.
    Detects buying/lead signals, handoff requests, and generates appropriate conversational responses.
    """
    try:
        lower_msg = user_message.lower()
        
        # Signal checks
        lead_signals = ["phone", "call me", "cost", "price", "pricing", "appointment", "book", "consultation", "timing", "schedule"]
        handoff_signals = ["talk to human", "speak to someone", "representative", "agent", "manager", "support person", "human please"]
        
        capture_lead = any(s in lower_msg for s in lead_signals)
        handoff = any(s in lower_msg for s in handoff_signals)
        
        llm = get_llm()
        if llm:
            kb_summary = "\n".join([
                f"- Q: {item.get('question', item.get('topic', ''))} | A: {item.get('answer', item.get('content', ''))}"
                for item in knowledge_base[:10]
            ])
            history_summary = "\n".join([f"{msg.get('role', 'user')}: {msg.get('content', '')}" for msg in conversation_history[-5:]])
            
            prompt = f"""You are the official conversational AI assistant for {brand_name}.
Answer based ONLY on the knowledge base provided below. If the answer is unknown or not in the knowledge base, state politely that you'll connect them with a team member.

Knowledge Base:
{kb_summary if kb_summary else "General information available via team."}

Conversation History:
{history_summary if history_summary else "No prior messages."}

Current User Message: "{user_message}"

Respond strictly in valid JSON:
{{
  "response_text": "your direct helpful answer",
  "detected_intent": "general_inquiry" | "booking" | "pricing" | "support" | "human_request",
  "confidence": 0.95,
  "suggested_followup_question": "optional follow up question or CTA"
}}"""
            res = await llm.ainvoke(prompt)
            parsed = json.loads(clean_json_markdown(res.content))
        else:
            if handoff:
                parsed = {
                    "response_text": f"I understand you'd like to speak with someone from our team. I'm connecting you to a team member at {brand_name} right away.",
                    "detected_intent": "human_request",
                    "confidence": 0.98,
                    "suggested_followup_question": "Could you please confirm your phone number or email?"
                }
            elif capture_lead:
                parsed = {
                    "response_text": f"Thank you for your interest! We offer comprehensive services at {brand_name}. Would you like us to schedule a consultation or share our pricing guide?",
                    "detected_intent": "pricing" if "price" in lower_msg or "cost" in lower_msg else "booking",
                    "confidence": 0.92,
                    "suggested_followup_question": "What date or time works best for you?"
                }
            else:
                parsed = {
                    "response_text": f"Hello! Welcome to {brand_name}. How can I assist you with our services today?",
                    "detected_intent": "general_inquiry",
                    "confidence": 0.90,
                    "suggested_followup_question": "Are you looking to book an appointment or learn about our treatments?"
                }

        # Action routing
        if handoff:
            action_type = "initiate_human_handoff"
        elif capture_lead:
            action_type = "capture_lead_from_chat"
        else:
            action_type = "continue_conversation"

        proposed_action = {
            "actionType": action_type,
            "payload": {
                "response_text": parsed.get("response_text"),
                "detected_intent": parsed.get("detected_intent"),
                "capture_lead": capture_lead,
                "handoff": handoff,
                "brand_name": brand_name
            }
        }

        return AgentResult(
            agent_id="stella_chatbot",
            coworker="stella",
            status="escalated" if handoff else "success",
            summary=f"Processed user message with intent '{parsed.get('detected_intent')}'. Action: {action_type}.",
            proposed_action=proposed_action,
            data=parsed,
            insights=[
                f"User intent classified as {parsed.get('detected_intent')}",
                f"Lead capture trigger: {capture_lead}",
                f"Human handoff required: {handoff}"
            ],
            confidence_score=float(parsed.get("confidence", 0.9))
        )
    except Exception as e:
        logger.error(f"Error in stella_chatbot: {e}", exc_info=True)
        return AgentResult(
            agent_id="stella_chatbot",
            coworker="stella",
            status="failed",
            summary=f"Chatbot failed: {str(e)}",
            proposed_action={},
            data={"error": str(e)},
            confidence_score=0.0
        )

