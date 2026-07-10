from src.core.state import OrchestratorState

def review_response_agent(state: OrchestratorState) -> dict:
    """
    Detects new reviews (both positive and negative) and drafts/posts sentiment-aware responses.
    """
    # Mocking review response
    responses = [
        "Thank you for the 5-star review! We are glad you enjoyed the service.",
        "We apologize for the inconvenience. Our team will reach out to resolve this."
    ]
    return {
        "review_responses": responses,
        "messages": [f"Review Response: Drafted {len(responses)} review replies."]
    }
