from src.core.state import OrchestratorState
import requests
import os
import random

def insights_agent(state: OrchestratorState) -> dict:
    """
    Pulls real performance data (Insights) from Meta and Google Ads APIs.
    """
    access_token = os.environ.get("META_ACCESS_TOKEN")
    ad_account_id = os.environ.get("META_AD_ACCOUNT_ID", "act_12345")
    
    if not access_token:
        # Mocking insights generation based on execution results
        mock_cpa = round(random.uniform(5.0, 50.0), 2)
        mock_spend = round(random.uniform(100.0, 1000.0), 2)
        
        insights_data = [
            f"Mock Meta Ads Insight: Spend ${mock_spend}, CPA ${mock_cpa}, Conversions: {int(mock_spend/mock_cpa)}",
            "Mock Google Ads Insight: High CTR (4.5%) on Exact Match Keywords."
        ]
        return {
            "insights": insights_data,
            "messages": ["Insights: META_ACCESS_TOKEN missing. Generated mock performance data."]
        }
        
    try:
        # Real Meta Marketing API Call for Insights
        url = f"https://graph.facebook.com/v19.0/{ad_account_id}/insights"
        params = {
            "date_preset": "last_7d",
            "fields": "spend,clicks,cpc,cpm,actions",
            "access_token": access_token
        }
        
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        
        data = response.json()
        campaign_data = data.get("data", [])
        
        if not campaign_data:
            return {
                "insights": ["No recent spend or impression data found on Meta."],
                "messages": ["Insights: Live pull successful, but account has no active data."]
            }
            
        latest = campaign_data[0]
        spend = latest.get("spend", 0)
        cpc = latest.get("cpc", 0)
        clicks = latest.get("clicks", 0)
        
        real_insights = [
            f"Meta Live Insight: Spend: ${spend}, Clicks: {clicks}, CPC: ${cpc}",
            "Google Live Insight: (Google Ads SDK pending OAuth implementation)"
        ]
        
        return {
            "insights": real_insights,
            "messages": ["Insights: Successfully pulled LIVE reporting data from Meta API."]
        }
        
    except Exception as e:
        return {
            "errors": [f"Insights Agent Error: {str(e)}"],
            "insights": ["Failed to pull live insights."]
        }
