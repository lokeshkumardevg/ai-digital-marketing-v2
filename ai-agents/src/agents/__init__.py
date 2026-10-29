"""
Agents package for Wheedle AI - 4 AI Coworkers (Max, Stella, Atlas, Echo) with 27 governed agents
"""
from .base import AgentResult, get_llm, clean_json_markdown
from . import max
from . import stella
from . import atlas
from . import echo

__all__ = [
    "AgentResult",
    "get_llm",
    "clean_json_markdown",
    "max",
    "stella",
    "atlas",
    "echo"
]

