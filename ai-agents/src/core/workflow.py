from langgraph.graph import StateGraph, END
from src.core.state import OrchestratorState

# Planning Agents (Pre-Publish)
from src.agents.planning.research import research_agent
from src.agents.planning.competitor import competitor_agent
from src.agents.planning.strategy import strategy_agent
from src.agents.planning.keyword import keyword_agent
from src.agents.planning.creative import creative_agent
from src.agents.planning.compliance import compliance_agent

# Execution Agents (Pre-Publish)
from src.agents.execution.google_ads import google_ads_agent
from src.agents.execution.meta_ads import meta_ads_agent
from src.agents.execution.microsoft_ads import microsoft_ads_agent

# Intelligence Agents (Post-Publish)
from src.agents.execution.action_executor import action_executor_agent
from src.agents.intelligence.ad_status import ad_status_agent
from src.agents.intelligence.insights import insights_agent
from src.agents.intelligence.budget import budget_agent
from src.agents.intelligence.anomaly import anomaly_agent
from src.agents.intelligence.reporting import reporting_agent

# Growth Agents (Post-Publish)
from src.agents.growth.review_generation import review_generation_agent
from src.agents.growth.review_response import review_response_agent
from src.agents.growth.social_publishing import social_publishing_agent
from src.agents.growth.social_engagement import social_engagement_agent
from src.agents.growth.listings_optimization import listings_optimization_agent
from src.agents.growth.lead_generation import lead_generation_agent
from src.agents.growth.contact_segmentation import contact_segmentation_agent

# Infrastructure Agents
from src.agents.infrastructure.template_design import template_design_agent
from src.agents.infrastructure.custom_agent import custom_agent_framework

# ==========================================
# WORKFLOW 1: CREATION (Pre-Publish)
# ==========================================
def build_creation_workflow():
    workflow = StateGraph(OrchestratorState)
    
    # Add Nodes
    workflow.add_node("research", research_agent)
    workflow.add_node("competitor", competitor_agent)
    workflow.add_node("strategy", strategy_agent)
    workflow.add_node("keyword_planner", keyword_agent)
    workflow.add_node("creative", creative_agent)
    workflow.add_node("compliance_check", compliance_agent)
    
    # Execution Nodes
    workflow.add_node("google_ads", google_ads_agent)
    workflow.add_node("meta_ads", meta_ads_agent)
    workflow.add_node("microsoft_ads", microsoft_ads_agent)
    
    # Edges
    workflow.set_entry_point("research")
    workflow.add_edge("research", "competitor")
    workflow.add_edge("competitor", "strategy")
    workflow.add_edge("strategy", "keyword_planner")
    workflow.add_edge("keyword_planner", "creative")
    workflow.add_edge("creative", "compliance_check")
    
    # Parallel Execution Routing
    def route_from_compliance(state):
        if state.get("compliance_status") == "rejected":
            return [] # End execution if rejected
        return ["google_ads", "meta_ads", "microsoft_ads"]
        
    workflow.add_conditional_edges(
        "compliance_check",
        route_from_compliance,
        {
            "google_ads": "google_ads",
            "meta_ads": "meta_ads",
            "microsoft_ads": "microsoft_ads"
        }
    )
    
    # End Creation after Execution
    workflow.add_edge("google_ads", END)
    workflow.add_edge("meta_ads", END)
    workflow.add_edge("microsoft_ads", END)
    
    return workflow.compile()


# ==========================================
# WORKFLOW 2: OPTIMIZATION (Post-Publish)
# ==========================================
def build_optimization_workflow():
    workflow = StateGraph(OrchestratorState)
    
    # Add Nodes
    workflow.add_node("ad_status_node", ad_status_agent)
    workflow.add_node("insights_node", insights_agent)
    workflow.add_node("anomaly", anomaly_agent)
    workflow.add_node("budget", budget_agent)
    workflow.add_node("action_executor", action_executor_agent)
    workflow.add_node("reporting", reporting_agent)
    
    # Growth Nodes
    workflow.add_node("review_generation", review_generation_agent)
    workflow.add_node("review_response", review_response_agent)
    workflow.add_node("social_publishing", social_publishing_agent)
    workflow.add_node("social_engagement", social_engagement_agent)
    workflow.add_node("listings_optimization", listings_optimization_agent)
    workflow.add_node("lead_generation", lead_generation_agent)
    workflow.add_node("contact_segmentation", contact_segmentation_agent)
    
    # Infrastructure Nodes
    workflow.add_node("template_design", template_design_agent)
    workflow.add_node("custom_agent", custom_agent_framework)
    
    # Intelligence Loop
    workflow.set_entry_point("ad_status_node")
    workflow.add_edge("ad_status_node", "insights_node")
    workflow.add_edge("insights_node", "anomaly")
    workflow.add_edge("anomaly", "budget")
    workflow.add_edge("budget", "action_executor")
    workflow.add_edge("action_executor", "reporting")
    
    # Parallel Growth Fanning
    def route_from_reporting(state):
        return [
            "review_generation", "review_response", "social_publishing", 
            "social_engagement", "listings_optimization", "lead_generation", 
            "contact_segmentation", "template_design", "custom_agent"
        ]
        
    workflow.add_conditional_edges(
        "reporting",
        route_from_reporting,
        {
            "review_generation": "review_generation",
            "review_response": "review_response",
            "social_publishing": "social_publishing",
            "social_engagement": "social_engagement",
            "listings_optimization": "listings_optimization",
            "lead_generation": "lead_generation",
            "contact_segmentation": "contact_segmentation",
            "template_design": "template_design",
            "custom_agent": "custom_agent"
        }
    )
    
    # End Growth Branches
    for node in ["review_generation", "review_response", "social_publishing", 
                 "social_engagement", "listings_optimization", "lead_generation", 
                 "contact_segmentation", "template_design", "custom_agent"]:
        workflow.add_edge(node, END)
        
    return workflow.compile()


# Export both workflows
creation_workflow = build_creation_workflow()
optimization_workflow = build_optimization_workflow()
