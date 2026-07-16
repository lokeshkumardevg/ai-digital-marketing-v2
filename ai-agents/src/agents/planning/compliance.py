from src.core.state import OrchestratorState
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
import os

class ComplianceOutput(BaseModel):
    is_compliant: bool = Field(..., description="True if the ads are safe to publish, False if they violate policies.")
    reason: str = Field(..., description="Reason for rejection, or 'All clear' if compliant.")

def compliance_agent(state: OrchestratorState) -> dict:
    """
    Checks the generated creatives against platform advertising policies before execution.
    """
    plan = state["plan"]
    creatives = plan.get("creatives", []) if isinstance(plan, dict) else plan.creatives
    
    if not creatives:
        return {"messages": ["Compliance Check: Skipped, no creatives to check."]}
        
    if not os.environ.get("OPENAI_API_KEY"):
        return {
            "compliance_status": "approved",
            "messages": ["Compliance Check: OPENAI_API_KEY missing. Mocking approval."]
        }
        
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    structured_llm = llm.with_structured_output(ComplianceOutput)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a strict Advertising Policy Reviewer for Google and Meta. Review the following ad copies. Reject them if they contain: get-rich-quick schemes, guaranteed medical cures, excessive profanity, discriminatory language, or misleading claims. If safe, approve them."),
        ("human", "Ad Copies to Review:\n{ad_copies}")
    ])
    
    ad_copies_text = "\n\n".join([
        f"Headline: {c.get('headline') if isinstance(c, dict) else c.headline}\nDesc: {c.get('description') if isinstance(c, dict) else c.description}" 
        for c in creatives
    ])
    
    chain = prompt | structured_llm
    
    try:
        response = chain.invoke({"ad_copies": ad_copies_text})
        
        status = "approved" if response.is_compliant else "rejected"
        
        return {
            "compliance_status": status,
            "messages": [f"Compliance Check: {status.upper()} - {response.reason}"]
        }
        
    except Exception as e:
        return {
            "errors": [f"Compliance Agent Error: {str(e)}"]
        }
