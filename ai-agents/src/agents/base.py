from typing import Dict, Any, Optional, List
import os
import json
from datetime import datetime

try:
    from pydantic import BaseModel, Field
    HAS_PYDANTIC = True
except ImportError:
    HAS_PYDANTIC = False
    class BaseModel:
        def __init__(self, **data):
            # Apply default values from annotations/attributes
            defaults = {
                "status": "success",
                "proposed_action": {},
                "data": {},
                "insights": [],
                "confidence_score": 0.95,
                "timestamp": datetime.utcnow().isoformat(),
            }
            defaults.update(data)
            for k, v in defaults.items():
                setattr(self, k, v)

        def model_dump(self) -> Dict[str, Any]:
            return {
                "agent_id": getattr(self, "agent_id", ""),
                "coworker": getattr(self, "coworker", ""),
                "status": getattr(self, "status", "success"),
                "summary": getattr(self, "summary", ""),
                "proposed_action": getattr(self, "proposed_action", {}),
                "data": getattr(self, "data", {}),
                "insights": getattr(self, "insights", []),
                "confidence_score": getattr(self, "confidence_score", 0.95),
                "timestamp": getattr(self, "timestamp", datetime.utcnow().isoformat()),
            }

        def dict(self) -> Dict[str, Any]:
            return self.model_dump()

    def Field(default=None, default_factory=None, description=""):
        return default

if HAS_PYDANTIC:
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
else:
    class AgentResult(BaseModel):
        pass

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
