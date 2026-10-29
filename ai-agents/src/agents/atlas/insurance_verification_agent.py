"""
Atlas Insurance Verification Agent
Agent ID: atlas_insurance_verification
Coworker: Atlas (Operations Coworker)

Validates patient insurance details and generates eligibility summaries,
pre-auth request forms, and patient-friendly cost estimates.

NOTE: Real-time insurance verification requires API integration with portals
such as Availity or Change Healthcare. This agent generates the structured
verification request and documentation — it does NOT make live insurance API calls.
"""

import json
from ..base import AgentResult, get_llm, clean_json_markdown


async def run_insurance_verification_agent(
    patient_details: dict,
    insurance_info: dict,
    requested_service: str,
    org_id: str = "",
) -> AgentResult:
    """
    Generate insurance eligibility summaries and pre-authorisation documentation.

    This agent prepares all the information a staff member (or future API
    integration) needs to verify coverage and pre-authorise a procedure.

    Args:
        patient_details: Dict with keys: name, dob, patient_id.
        insurance_info: Dict with keys: provider, policy_number, group_number,
                        member_id, card_front_text (OCR or manual entry).
        requested_service: The dental/medical procedure being requested.
        org_id: Optional organisation identifier.

    Returns:
        AgentResult with eligibility summary, pre-auth flag, patient estimate,
        and a structured verification form.
    """
    llm = get_llm(model="gpt-4o-mini", temperature=0.3, max_tokens=1600)
    patient_name = patient_details.get("name", "Patient")
    provider = insurance_info.get("provider", "the insurance provider")

    if llm is None:
        return AgentResult(
            agent_id="atlas_insurance_verification",
            coworker="atlas",
            status="success",
            summary=(
                f"Insurance verification prepared for {patient_name} ({provider}) — "
                f"{requested_service}. Pre-auth likely required. Mock mode."
            ),
            proposed_action={
                "actionType": "submit_insurance_verification",
                "payload": {
                    "eligibility_summary": (
                        f"{patient_name} is covered under Delta Dental PPO (Group: 00123). "
                        f"Annual maximum: $1,500. Deductible: $50 (met). "
                        f"Crown procedure covered at 50% after deductible under major restorative benefits."
                    ),
                    "pre_auth_required": True,
                    "patient_estimate": (
                        "Estimated patient responsibility: $450–$600 depending on crown type. "
                        "Delta Dental covers 50% of allowed amount ($900). "
                        "Balance billed if provider is out-of-network."
                    ),
                    "verification_form": {
                        "patient_name": patient_name,
                        "dob": patient_details.get("dob"),
                        "member_id": insurance_info.get("member_id"),
                        "group_number": insurance_info.get("group_number"),
                        "policy_number": insurance_info.get("policy_number"),
                        "provider": provider,
                        "requested_service": requested_service,
                        "service_code": "D2740",
                        "pre_auth_form_fields": {
                            "treating_dentist": "",
                            "NPI": "",
                            "diagnosis_code": "K02.9",
                            "service_date": "",
                            "clinical_notes": "Required for crown pre-auth",
                        },
                    },
                },
            },
            data={
                "eligibility_check": "Coverage confirmed — Delta Dental PPO active",
                "common_coverage_rules": [
                    "Major restorative (crowns) covered at 50% after deductible.",
                    "Waiting period: 12 months for major services (check enrolment date).",
                    "Pre-auth required for procedures over $300.",
                    "Annual maximum: $1,500 per calendar year.",
                ],
                "questions_for_insurer": [
                    "Is the annual deductible met for this patient?",
                    "What is the allowed amount for procedure code D2740?",
                    "Is pre-authorisation required and what is the turnaround time?",
                    "Is our provider in-network for this patient's plan?",
                    "Are there any frequency limitations for crowns?",
                ],
                "pre_auth_required_flag": "yes",
                "patient_friendly_explanation": (
                    "Your Delta Dental plan covers about 50% of crown costs. "
                    "Based on our fee schedule, you can expect to pay around $450–$600 out of pocket. "
                    "We'll submit a pre-authorisation request before scheduling to confirm the exact amount."
                ),
            },
            insights=[
                f"Provider: {provider} — PPO plan detected.",
                "Pre-authorisation: YES — required for crown procedures.",
                "Patient estimate generated based on standard Delta Dental benefit schedule.",
                "Verification form structured for Availity submission.",
            ],
            confidence_score=0.88,
        )

    try:
        prompt = f"""You are a dental insurance verification specialist.

Patient: {json.dumps(patient_details)}
Insurance: {json.dumps(insurance_info)}
Requested service: {requested_service}

Generate a comprehensive verification package. Respond with JSON:
{{
  "eligibility_summary": "Summary of coverage based on policy information",
  "common_coverage_rules": ["rule1", "rule2", "rule3", "rule4"],
  "pre_auth_required": true | false,
  "pre_auth_form_fields": {{
    "treating_dentist": "",
    "NPI": "",
    "diagnosis_code": "ICD-10 code if applicable",
    "service_code": "ADA/CDT procedure code",
    "clinical_notes": "What notes are required"
  }},
  "questions_for_insurer": ["q1", "q2", "q3", "q4", "q5"],
  "patient_estimate": "Patient-friendly explanation of expected out-of-pocket cost",
  "patient_friendly_explanation": "Simple 2-3 sentence explanation for the patient",
  "pre_auth_required_flag": "yes | no | varies",
  "summary": "one-sentence summary of verification status"
}}
Return only valid JSON."""

        response = await llm.ainvoke(prompt)
        parsed = json.loads(clean_json_markdown(response.content))

        return AgentResult(
            agent_id="atlas_insurance_verification",
            coworker="atlas",
            status="success",
            summary=parsed.get("summary", f"Verification prepared for {patient_name}."),
            proposed_action={
                "actionType": "submit_insurance_verification",
                "payload": {
                    "eligibility_summary": parsed.get("eligibility_summary"),
                    "pre_auth_required": parsed.get("pre_auth_required", False),
                    "patient_estimate": parsed.get("patient_estimate"),
                    "verification_form": {
                        "patient_name": patient_name,
                        "dob": patient_details.get("dob"),
                        "member_id": insurance_info.get("member_id"),
                        "group_number": insurance_info.get("group_number"),
                        "policy_number": insurance_info.get("policy_number"),
                        "provider": provider,
                        "requested_service": requested_service,
                        **parsed.get("pre_auth_form_fields", {}),
                    },
                },
            },
            data=parsed,
            insights=[
                f"Provider: {provider}",
                f"Pre-auth required: {parsed.get('pre_auth_required_flag', 'varies')}",
                f"Patient estimate generated.",
                f"{len(parsed.get('questions_for_insurer', []))} verification questions prepared.",
            ],
            confidence_score=0.87,
        )

    except Exception as exc:
        return AgentResult(
            agent_id="atlas_insurance_verification",
            coworker="atlas",
            status="failed",
            summary=f"Insurance verification agent error: {exc}",
            data={"error": str(exc)},
        )
