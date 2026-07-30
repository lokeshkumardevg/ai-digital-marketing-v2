from src.core.state import OrchestratorState
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import os

load_dotenv()

class BudgetShift(BaseModel):
    shift_recommended: bool = Field(..., description="True if budget should be shifted between platforms.")
    from_platform: str = Field(..., description="Platform to reduce budget from (or 'None' if no shift)")
    to_platform: str = Field(..., description="Platform to increase budget on (or 'None' if no shift)")
    shift_amount_percent: int = Field(..., description="Percentage of budget to shift (0 if no shift)")
    reason: str = Field(..., description="Data-driven explanation for this decision.")

def budget_agent(state: OrchestratorState) -> dict:
    """
    Analyzes live campaign performance data and recommends data-driven budget shifts across platforms.
    """
    insights = state.get("insights", [])
    anomalies = state.get("anomalies", [])
    goal = state.get("client_goal", {})
    budget = goal.get("budget") if isinstance(goal, dict) else getattr(goal, "budget", 0)

    if not insights:
        return {"messages": ["Budget analysis skipped - no insights available."]}

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return {
            "budget_shifts": [],
            "messages": ["Budget Agent: OPENAI_API_KEY missing. Skipping budget analysis."]
        }

    try:
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1, openai_api_key=api_key)
        structured_llm = llm.with_structured_output(BudgetShift)

        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a Senior AI Media Buyer managing a ${budget} campaign budget across multiple platforms. Analyze the performance data carefully. Only recommend shifting budget if there is clear, statistically significant evidence of one platform outperforming another (e.g., 30%+ difference in CPA or ROAS). If the data is balanced or insufficient, do NOT recommend shifting. Base decisions strictly on numbers, never on assumptions."),
            ("human", "Performance Insights:\n{insights_text}\n\nActive Anomalies:\n{anomalies_text}\n\nTotal Budget: ${budget}")
        ])

        chain = prompt | structured_llm
        response = chain.invoke({
            "insights_text": "\n".join(insights),
            "anomalies_text": "\n".join(anomalies) if anomalies else "No anomalies.",
            "budget": budget
        })

        shifts = []
        actions_taken = []
        if response.shift_recommended and response.from_platform != "None":
            shift_msg = (
                f"📊 Budget Rebalanced: Moved {response.shift_amount_percent}% from "
                f"{response.from_platform} → {response.to_platform}. "
                f"Reason: {response.reason}"
            )
            shifts.append(shift_msg)
            actions_taken.append(shift_msg)
            status_msg = f"Budget Agent: Reallocated {response.shift_amount_percent}% budget from {response.from_platform} to {response.to_platform}."
        else:
            status_msg = f"Budget Agent: All platform allocations are optimal. No rebalancing required. Reason: {response.reason}"

        return {
            "budget_shifts": shifts,
            "actions_taken": actions_taken,
            "messages": [status_msg]
        }
    except Exception as e:
        return {
            "budget_shifts": [],
            "errors": [f"Budget Agent Error: {str(e)}"]
        }
