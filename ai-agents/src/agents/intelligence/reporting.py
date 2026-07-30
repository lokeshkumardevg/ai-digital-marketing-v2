from src.core.state import OrchestratorState
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
import os

load_dotenv()

def reporting_agent(state: OrchestratorState) -> dict:
    """
    Generates a human-readable, data-driven performance report for the client using OpenAI GPT.
    """
    insights = state.get("insights", [])
    actions = state.get("actions_taken", [])
    budget_shifts = state.get("budget_shifts", [])
    anomalies = state.get("anomalies", [])
    goal = state.get("client_goal", {})
    industry = goal.get("industry") if isinstance(goal, dict) else getattr(goal, "industry", "Digital Marketing")

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return {
            "client_report": "OPENAI_API_KEY not configured. Please add the key to .env to enable AI-powered report generation.",
            "messages": ["Reporting Agent: API key missing."]
        }

    try:
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2, openai_api_key=api_key)

        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an elite Senior Account Manager at a top-tier Digital Marketing Agency writing a highly accurate, professional weekly performance update for a client in the {industry} industry. Your report MUST be based entirely on the provided insights, actions, and anomalies. DO NOT fabricate, guess, or hallucinate ANY numerical metrics, statistics, percentages, or figures under any circumstances. If numerical data is missing, focus entirely on qualitative strategy, campaign structure, and forward-looking recommendations. Keep it under 3 paragraphs. Use plain English, no jargon."),
            ("human", "Campaign Insights:\n{insights}\n\nAI Actions Taken:\n{actions}\n\nBudget Shifts:\n{budget_shifts}\n\nAnomalies Detected:\n{anomalies}")
        ])

        chain = prompt | llm
        response = chain.invoke({
            "industry": industry,
            "insights": "\n".join(insights) if insights else "No new insights collected this cycle.",
            "actions": "\n".join(actions) if actions else "No automated actions taken.",
            "budget_shifts": "\n".join(budget_shifts) if budget_shifts else "No budget reallocation needed.",
            "anomalies": "\n".join(anomalies) if anomalies else "No critical anomalies detected."
        })

        return {
            "client_report": response.content,
            "messages": ["Reporting Agent: Generated detailed AI-powered performance report."]
        }
    except Exception as e:
        return {
            "errors": [f"Reporting Agent Error: {str(e)}"]
        }
