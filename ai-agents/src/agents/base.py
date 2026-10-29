from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
import os
import json
from datetime import datetime

class AgentResult(BaseModel):
    agent_id: str
    coworker: str
    status: str = Field(default="success", description="'success', 'escalated', 'failed'")
    summary: str
    proposed_action: Dict[str, Any] = Field(default_factory=dict)
    data: Dict[str, Any] = Field(default_factory=dict)
    insights: List[str] = Field(default_factory=list)
    confidence_score: float = 0.95
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

def get_llm(model: str = "gpt-4o-mini", temperature: float = 0.5, max_tokens: int = 2000):
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return None
    try:
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(model=model, temperature=temperature, max_tokens=max_tokens, openai_api_key=api_key)
    except Exception:
        return None

def clean_json_markdown(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    return cleaned.strip()

