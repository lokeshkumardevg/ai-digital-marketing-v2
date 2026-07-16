from pydantic import BaseModel, Field
from typing import List, Optional

class CampaignGoal(BaseModel):
    objective: str = Field(..., description="The main goal, e.g., 'lead generation'")
    budget: float = Field(..., description="Monthly budget in USD")
    industry: str = Field(..., description="Target industry, e.g., 'B2B SaaS'")
    target_audience: str = Field(..., description="Description of the target audience")
    target_country: str = Field("IN", description="Two-letter country code for targeting (e.g., IN, US, GB)")
    website_url: Optional[str] = Field(None, description="Optional website URL for the AI to read and understand the brand")

class PlatformAllocation(BaseModel):
    platform: str = Field(..., description="E.g., 'Google Ads', 'Meta Ads'")
    budget_allocation: float = Field(..., description="Allocated budget for this platform")
    strategy_notes: str = Field(..., description="Notes on how to approach this platform")

class CreativeAsset(BaseModel):
    headline: str = Field(..., description="Ad headline")
    description: str = Field(..., description="Ad description/body copy")
    image_prompt: Optional[str] = Field(None, description="Prompt for image generation if needed")

class CampaignPlan(BaseModel):
    allocations: List[PlatformAllocation] = []
    creatives: List[CreativeAsset] = []
    keywords: List[str] = []
    status: str = "draft"
