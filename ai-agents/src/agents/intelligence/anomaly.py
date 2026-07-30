from src.core.state import OrchestratorState
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import os
import requests

load_dotenv()

class AnomalyOutput(BaseModel):
    is_anomaly: bool = Field(..., description="True if a critical metric anomaly is detected (e.g. CPA too high, 0 conversions after high spend)")
    action_recommended: str = Field(..., description="Action to take, e.g., 'PAUSE_AD', 'DECREASE_BUDGET', 'NONE'")
    reason: str = Field(..., description="Detailed explanation of the finding.")

def anomaly_agent(state: OrchestratorState) -> dict:
    """
    Detects unusual performance drops, ad fatigue, or sudden CPA spikes using live data + OpenAI GPT.
    """
    insights = state.get("insights", [])
    if not insights:
        return {"messages": ["Anomaly detection skipped - no insights available."]}

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return {
            "anomalies": [],
            "messages": ["Anomaly Agent: OPENAI_API_KEY missing. Skipping detection."]
        }

    try:
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0, openai_api_key=api_key)
        structured_llm = llm.with_structured_output(AnomalyOutput)

        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an AI Data Scientist monitoring live advertising campaigns. Analyze the performance insights carefully. Flag as an anomaly ONLY if: (1) CPA is dangerously high (>3x industry average), (2) There is significant ad spend ($50+) with zero conversions, (3) CTR dropped more than 50% vs baseline, or (4) ROAS fell below 1.0. Otherwise, mark as healthy. Recommend specific corrective actions when anomalies exist."),
            ("human", "Live Campaign Performance Data:\n{insights_text}")
        ])

        insights_text = "\n".join(insights)
        chain = prompt | structured_llm

        response = chain.invoke({"insights_text": insights_text})

        anomalies = []
        actions_taken = []
        if response.is_anomaly:
            anomaly_msg = f"🚨 CRITICAL ANOMALY DETECTED: {response.reason} → Recommended Action: {response.action_recommended}"
            anomalies.append(anomaly_msg)
            actions_taken.append(f"Auto-action: {response.action_recommended} triggered based on anomaly analysis.")
            status_msg = f"Anomaly Detection: Critical issue found — {response.action_recommended} recommended."
        else:
            status_msg = "Anomaly Detection: Campaigns are healthy. No critical anomalies detected."

        return {
            "anomalies": anomalies,
            "actions_taken": actions_taken,
            "messages": [status_msg]
        }
    except Exception as e:
        return {
            "anomalies": [],
            "errors": [f"Anomaly Agent Error: {str(e)}"]
        }
