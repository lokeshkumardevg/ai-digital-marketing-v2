from src.core.state import OrchestratorState
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
import os

class BudgetShift(BaseModel):
    shift_recommended: bool = Field(..., description="True if budget should be shifted between platforms.")
    from_platform: str = Field(..., description="Platform to take budget from (e.g., 'Meta', 'Google'), or 'None'")
    to_platform: str = Field(..., description="Platform to give budget to, or 'None'")
    reason: str = Field(..., description="Explanation for this shift.")

def budget_agent(state: OrchestratorState) -> dict:
    """
    Analyzes live insights and recommends budget shifts across platforms to maximize ROI.
    """
    insights = state.get("insights", [])
    if not insights:
        return {"messages": ["Budget analysis skipped - no insights available."]}
        
    if not os.environ.get("OPENAI_API_KEY"):
        return {
            "budget_shifts": ["Mock Shift: Moved $100 from Meta to Google due to lower CPA."],
            "messages": ["Budget Agent: OPENAI_API_KEY missing. Mocking shift."]
        }
        
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1)
    structured_llm = llm.with_structured_output(BudgetShift)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an AI Media Buyer. Look at the performance insights. If one platform has a significantly lower Cost Per Acquisition (CPA) or higher ROI than another, recommend shifting budget towards the better performing platform. If data is insufficient or balanced, do not shift."),
        ("human", "Live Insights:\n{insights_text}")
    ])
    
    chain = prompt | structured_llm
    
    try:
        response = chain.invoke({"insights_text": "\n".join(insights)})
        
        shifts = []
        if response.shift_recommended:
            shifts.append(f"Shifted budget from {response.from_platform} to {response.to_platform}. Reason: {response.reason}")
            
        status = "Budget shifted to maximize ROI." if shifts else "Budgets are optimal, no shift needed."
            
        return {
            "budget_shifts": shifts,
            "messages": [f"Budget Agent: {status}"]
        }
    except Exception as e:
        return {
            "errors": [f"Budget Agent Error: {str(e)}"]
        }
