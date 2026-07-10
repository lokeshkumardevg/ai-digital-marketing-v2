from src.core.state import OrchestratorState

def review_generation_agent(state: OrchestratorState) -> dict:
    """
    Identifies happy customers and runs a compliant, automated flow to ask for reviews.
    """
    # Mocking review generation
    reviews_generated = 5
    return {
        "reviews_generated": reviews_generated,
        "messages": [f"Review Generation: Sent requests to {reviews_generated} recent happy customers."]
    }
