from src.core.state import OrchestratorState
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
import os

def reporting_agent(state: OrchestratorState) -> dict:
    """
    Generates a human-readable performance report for the client.
    """
    insights = state.get("insights", [])
    actions = state.get("actions_taken", [])
    
    if not os.environ.get("OPENAI_API_KEY"):
        return {
            "client_report": "Mock Report: Campaigns are running smoothly. Some budget was shifted to improve ROI.",
            "messages": ["Reporting Agent: Mock report generated."]
        }
        
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an Account Manager for a Digital Marketing Agency. Write a short, encouraging, and easy-to-understand 2-paragraph update for the client. Summarize the insights and explain the actions the AI took (like pausing bad ads or shifting budgets) to save them money and improve results. Keep it professional but accessible. No technical jargon."),
        ("human", "Live Insights: {insights}\nActions Taken by AI: {actions}")
    ])
    
    chain = prompt | llm
    
    try:
        response = chain.invoke({
            "insights": "\n".join(insights) if insights else "No new insights.",
            "actions": "\n".join(actions) if actions else "No actions taken."
        })
        
        return {
            "client_report": response.content,
            "messages": ["Reporting Agent: Generated human-readable client report."]
        }
    except Exception as e:
        return {
            "errors": [f"Reporting Agent Error: {str(e)}"]
        }
