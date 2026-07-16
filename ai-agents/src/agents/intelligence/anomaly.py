from src.core.state import OrchestratorState
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
import os

class AnomalyOutput(BaseModel):
    is_anomaly: bool = Field(..., description="True if a critical metric anomaly is detected (e.g. CPA too high, 0 conversions after high spend)")
    action_recommended: str = Field(..., description="Action to take, e.g., 'PAUSE_AD', 'DECREASE_BUDGET', 'NONE'")
    reason: str = Field(..., description="Detailed explanation of the finding.")

def anomaly_agent(state: OrchestratorState) -> dict:
    """
    Detects unusual performance drops, ad fatigue, or sudden spikes in CPA using LLM.
    """
    insights = state.get("insights", [])
    if not insights:
        return {"messages": ["Anomaly detection skipped - no insights available."]}
        
    if not os.environ.get("OPENAI_API_KEY"):
        return {
            "anomalies": ["Mock Anomaly: CPA spiked by 20%."],
            "messages": ["Anomaly Detection: OPENAI_API_KEY missing. Mocking detection."]
        }
        
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    structured_llm = llm.with_structured_output(AnomalyOutput)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an AI Data Scientist monitoring live ad campaigns. Look at the provided insights. If CPA is dangerously high, or if there is significant spend with 0 conversions, flag it as an anomaly and recommend an action (like PAUSE_AD). Otherwise, if performance is normal, report no anomalies."),
        ("human", "Live Campaign Insights:\n{insights_text}")
    ])
    
    insights_text = "\n".join(insights)
    
    chain = prompt | structured_llm
    
    try:
        response = chain.invoke({"insights_text": insights_text})
        
        anomalies = []
        if response.is_anomaly:
            anomalies.append(f"CRITICAL ANOMALY: {response.reason} -> Recommended Action: {response.action_recommended}")
            
        status = "Found anomalies!" if response.is_anomaly else "Campaign is healthy."
            
        return {
            "anomalies": anomalies,
            "messages": [f"Anomaly Detection: {status}"]
        }
        
    except Exception as e:
        return {
            "errors": [f"Anomaly Agent Error: {str(e)}"]
        }
