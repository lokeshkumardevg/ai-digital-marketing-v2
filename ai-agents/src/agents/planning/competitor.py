from src.core.state import OrchestratorState
import requests
import os

def competitor_agent(state: OrchestratorState) -> dict:
    """
    Calls the Meta Ad Library API to pull real competitor active ads.
    """
    goal = state["client_goal"]
    industry = goal.get("industry") if isinstance(goal, dict) else goal.industry
    
    # Check for Meta Access Token
    access_token = os.environ.get("META_ACCESS_TOKEN")
    
    if not access_token:
        mock_data = f"Mock Competitor Data for {industry}: Competitors are running 20% discount offers and using short-form video ads."
        return {
            "competitor_data": mock_data,
            "current_step": "strategy",
            "messages": ["Competitor Research: META_ACCESS_TOKEN missing. Using mock data."]
        }
        
    try:
        # Real Meta Ad Library API Call
        country = goal.get("target_country", "IN") if isinstance(goal, dict) else goal.target_country
        url = "https://graph.facebook.com/v19.0/ads_archive"
        params = {
            "search_terms": industry,
            "ad_reached_countries": f"['{country}']",
            "ad_active_status": "ACTIVE",
            "fields": "ad_creation_time,ad_creative_bodies,ad_creative_link_captions,page_name",
            "access_token": access_token
        }
        
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        
        data = response.json()
        ads = data.get("data", [])[:5] # Get top 5 ads
        
        if not ads:
            return {
                "competitor_data": "No active competitor ads found in Ad Library.",
                "current_step": "strategy",
                "messages": ["Competitor Research: Searched Meta Ad Library, no results."]
            }
            
        competitor_summary = f"Found {len(ads)} active competitor ads on Meta:\n"
        for ad in ads:
            page = ad.get("page_name", "Unknown Brand")
            bodies = ad.get("ad_creative_bodies", ["No text"])
            competitor_summary += f"- {page}: {bodies[0]}\n"
            
        return {
            "competitor_data": competitor_summary,
            "current_step": "strategy",
            "messages": [f"Competitor Research: Successfully pulled live ads from Meta for '{industry}'."]
        }
        
    except Exception as e:
        return {
            "errors": [f"Competitor Agent Error: {str(e)}"],
            "competitor_data": "Failed to pull competitor data."
        }
