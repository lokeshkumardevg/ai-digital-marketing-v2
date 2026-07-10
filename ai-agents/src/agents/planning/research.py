from src.core.state import OrchestratorState
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from bs4 import BeautifulSoup
import requests
import os

def research_agent(state: OrchestratorState) -> dict:
    """
    Visits the client's website, scrapes the text, and extracts brand context.
    """
    goal = state["client_goal"]
    website_url = goal.get("website_url") if isinstance(goal, dict) else goal.website_url
    
    if not website_url:
        return {
            "brand_context": "No website provided. Use general industry knowledge.",
            "current_step": "strategy",
            "messages": ["Research: Skipped, no website URL provided."]
        }
        
    try:
        # 1. Fetch website content
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        response = requests.get(website_url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # 2. Extract text using BeautifulSoup
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer"]):
            script.extract()
            
        text = soup.get_text(separator=' ', strip=True)
        # Limit text to first 3000 characters to save tokens and focus on main content
        text = text[:3000]
        
        if not os.environ.get("OPENAI_API_KEY"):
            return {
                "brand_context": f"MOCK SCRAPED DATA: {text[:200]}...",
                "current_step": "strategy",
                "messages": ["Research: Scraped website, but OPENAI_API_KEY missing for summarization."]
            }
            
        # 3. Summarize using LLM
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert brand analyst. Read the following website text and extract the company's key value propositions, main products/services, target audience, and brand tone. Keep the summary under 150 words."),
            ("human", "Website Text:\n{text}")
        ])
        
        chain = prompt | llm
        result = chain.invoke({"text": text})
        
        brand_context = result.content
        
        return {
            "brand_context": brand_context,
            "current_step": "strategy",
            "messages": [f"Research: Successfully scraped and analyzed {website_url}."]
        }
        
    except Exception as e:
        return {
            "errors": [f"Research Agent Error: Failed to scrape {website_url} - {str(e)}"],
            "brand_context": "Failed to extract website context due to an error. Use general industry knowledge."
        }
