from langgraph.graph import StateGraph, END
from src.core.state import OrchestratorState
from src.agents.planning.research import research_agent
from src.agents.planning.strategy import strategy_agent
from src.agents.planning.keyword import keyword_agent
from src.agents.planning.creative import creative_agent
from src.agents.execution.google_ads import google_ads_agent
from src.agents.execution.meta_ads import meta_ads_agent
from src.agents.execution.microsoft_ads import microsoft_ads_agent
from src.agents.intelligence.insights import insights_agent
from src.agents.intelligence.budget import budget_agent
from src.agents.intelligence.anomaly import anomaly_agent
from src.agents.growth.review_generation import review_generation_agent
from src.agents.growth.review_response import review_response_agent
from src.agents.growth.social_publishing import social_publishing_agent
from src.agents.growth.social_engagement import social_engagement_agent
from src.agents.growth.listings_optimization import listings_optimization_agent
from src.agents.growth.lead_generation import lead_generation_agent
from src.agents.growth.contact_segmentation import contact_segmentation_agent
from src.agents.infrastructure.template_design import template_design_agent
from src.agents.infrastructure.custom_agent import custom_agent_framework

def build_workflow():
    workflow = StateGraph(OrchestratorState)
    
    # Add Nodes
    workflow.add_node("research", research_agent)
    workflow.add_node("strategy", strategy_agent)
    workflow.add_node("keyword_planner", keyword_agent)
    workflow.add_node("creative", creative_agent)
    
    # Execution Nodes
    workflow.add_node("google_ads", google_ads_agent)
    workflow.add_node("meta_ads", meta_ads_agent)
    workflow.add_node("microsoft_ads", microsoft_ads_agent)
    
    # Intelligence Nodes
    workflow.add_node("insights_node", insights_agent)
    workflow.add_node("budget", budget_agent)
    workflow.add_node("anomaly", anomaly_agent)
    
    # Growth Nodes (Phase 3 & 4)
    workflow.add_node("review_generation", review_generation_agent)
    workflow.add_node("review_response", review_response_agent)
    workflow.add_node("social_publishing", social_publishing_agent)
    workflow.add_node("social_engagement", social_engagement_agent)
    workflow.add_node("listings_optimization", listings_optimization_agent)
    workflow.add_node("lead_generation", lead_generation_agent)
    workflow.add_node("contact_segmentation", contact_segmentation_agent)
    
    # Infrastructure Nodes (Phase 5)
    workflow.add_node("template_design", template_design_agent)
    workflow.add_node("custom_agent", custom_agent_framework)
    
    # Edges
    workflow.set_entry_point("research")
    workflow.add_edge("research", "strategy")
    workflow.add_edge("strategy", "keyword_planner")
    workflow.add_edge("keyword_planner", "creative")
    
    # [SPEED OPTIMIZATION] Parallel Execution
    # Route to all platform execution agents SIMULTANEOUSLY instead of sequentially
    def route_from_creative(state):
        return ["google_ads", "meta_ads", "microsoft_ads"]
        
    workflow.add_conditional_edges(
        "creative",
        route_from_creative,
        {
            "google_ads": "google_ads",
            "meta_ads": "meta_ads",
            "microsoft_ads": "microsoft_ads"
        }
    )
    
    # [SPEED OPTIMIZATION] Join Parallel Branches
    # All execution agents converge into the insights agent
    workflow.add_edge("google_ads", "insights_node")
    workflow.add_edge("meta_ads", "insights_node")
    workflow.add_edge("microsoft_ads", "insights_node")
    
    workflow.add_edge("insights_node", "budget")
    workflow.add_edge("budget", "anomaly")
    
    # [SPEED OPTIMIZATION] Parallel Growth & Infrastructure
    # After anomaly detection, we can run all independent reputation, CRM, and infra agents in parallel
    def route_from_anomaly(state):
        return [
            "review_generation", "review_response", "social_publishing", 
            "social_engagement", "listings_optimization", "lead_generation", 
            "contact_segmentation", "template_design", "custom_agent"
        ]
        
    workflow.add_conditional_edges(
        "anomaly",
        route_from_anomaly,
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
    
    # Finish
    workflow.add_edge("review_generation", END)
    workflow.add_edge("review_response", END)
    workflow.add_edge("social_publishing", END)
    workflow.add_edge("social_engagement", END)
    workflow.add_edge("listings_optimization", END)
    workflow.add_edge("lead_generation", END)
    workflow.add_edge("contact_segmentation", END)
    workflow.add_edge("template_design", END)
    workflow.add_edge("custom_agent", END)
    
    return workflow.compile()

app_workflow = build_workflow()
