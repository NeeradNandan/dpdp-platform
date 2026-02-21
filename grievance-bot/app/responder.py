"""Template-based response generator for grievance requests."""

import uuid
from datetime import datetime, timezone

from app.models import AIResponse, ClassificationResult, GrievanceRequest

# DPDP Act 2023 compliant response templates
TEMPLATES: dict[str, str] = {
    "erasure": (
        "We acknowledge receipt of your request for erasure of your personal data. "
        "Under Section 12(1) of the Digital Personal Data Protection Act, 2023 (DPDP Act), "
        "you have the right to request erasure of personal data where it is no longer necessary "
        "for the purpose for which it was collected, or where you have withdrawn consent. "
        "We will process your erasure request within 90 days from the date of receipt. "
        "Please note that certain data may be retained where required for compliance with legal obligations, "
        "ongoing legal proceedings, or to establish, exercise, or defend legal claims. "
        "You will receive a confirmation once the erasure process is complete."
    ),
    "access": (
        "We acknowledge receipt of your request for access to your personal data. "
        "Under Section 11 of the DPDP Act, 2023, you have the right to obtain a summary of "
        "the personal data we hold and the processing activities undertaken. "
        "We will provide you with the categories of data collected, purposes of processing, "
        "and the data in a clear and concise format. You may request the data in PDF or JSON format. "
        "We will respond to your access request within 90 days from the date of receipt. "
        "You will receive a secure link to access your data once it is prepared."
    ),
    "correction": (
        "We acknowledge receipt of your request for correction of your personal data. "
        "Under Section 11(1)(a) of the DPDP Act, 2023, you have the right to correct inaccurate "
        "or incomplete personal data. To process your request, we may require supporting documentation "
        "to verify the corrections. We will review your submission and update our records accordingly. "
        "You will receive confirmation of the correction within 90 days. "
        "If we are unable to make the requested correction, we will provide reasons in writing."
    ),
    "portability": (
        "We acknowledge receipt of your request for data portability. "
        "Under Section 11(1)(b) of the DPDP Act, 2023, you have the right to receive your personal data "
        "in a structured, commonly used, and machine-readable format. "
        "We will provide your data in a format that supports interoperability (e.g., JSON, CSV) "
        "to facilitate transfer to another data fiduciary. "
        "We will process your portability request within 90 days. "
        "You will receive a secure download link once your data package is ready."
    ),
    "objection": (
        "We acknowledge receipt of your objection to the processing of your personal data. "
        "Under the DPDP Act, 2023, you have the right to withdraw consent and object to processing "
        "where consent was the legal basis. Please note that withdrawal of consent does not affect "
        "the lawfulness of processing based on consent before its withdrawal. "
        "Certain processing may continue under other legal bases such as compliance with law, "
        "performance of a contract, or legitimate interests. "
        "We will cease processing for consent-based activities within 90 days. "
        "You will receive confirmation of the changes to our processing activities."
    ),
}


class GrievanceResponder:
    """Generates DPDP Act compliant responses for grievance requests."""

    def generate_response(
        self,
        classification: ClassificationResult,
        request: GrievanceRequest,
    ) -> AIResponse:
        """
        Generate a template-based response for the grievance.

        Args:
            classification: The classification result from the classifier.
            request: The original grievance request.

        Returns:
            AIResponse with the generated response and metadata.
        """
        req_type = classification.request_type
        template = TEMPLATES.get(req_type, TEMPLATES["access"])  # Fallback to access

        # Build suggested actions for compliance team
        suggested_actions = self._get_suggested_actions(classification, request)

        # Determine SLA based on complexity
        sla_days = self._get_sla_days(classification)

        case_id = f"GRV-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"

        return AIResponse(
            case_id=case_id,
            response_text=template,
            language=request.language,
            suggested_actions=suggested_actions,
            sla_days=sla_days,
            escalation_required=classification.requires_manual_review,
            generated_at=datetime.now(timezone.utc).isoformat(),
        )

    def _get_suggested_actions(
        self,
        classification: ClassificationResult,
        request: GrievanceRequest,
    ) -> list[str]:
        """Generate suggested actions for the compliance team."""
        actions: list[str] = []

        if classification.requires_manual_review:
            actions.append("Flag for manual review by compliance officer")
            actions.append("Verify data principal identity before processing")

        req_type = classification.request_type
        if req_type == "erasure":
            actions.append("Identify all systems holding the data principal's data")
            actions.append("Execute erasure workflow per retention policy")
            actions.append("Document erasure completion and retain audit trail")
        elif req_type == "access":
            actions.append("Compile data summary from all relevant systems")
            actions.append("Prepare data in requested format (PDF/JSON)")
            actions.append("Send secure access link to data principal")
        elif req_type == "correction":
            actions.append("Request supporting documentation if not provided")
            actions.append("Verify correction request against source documents")
            actions.append("Update records and notify downstream processors")
        elif req_type == "portability":
            actions.append("Export data in machine-readable format")
            actions.append("Ensure format supports interoperability")
            actions.append("Provide secure download mechanism")
        elif req_type == "objection":
            actions.append("Identify consent-based processing activities")
            actions.append("Cease processing for withdrawn consent")
            actions.append("Update consent records and notify data principal")

        if classification.priority in ("high", "critical"):
            actions.append("Prioritize in queue - expedite processing")

        return actions

    def _get_sla_days(self, classification: ClassificationResult) -> int:
        """Determine SLA days based on complexity and priority."""
        base_sla = 90  # DPDP Act default
        if classification.estimated_complexity == "complex":
            return min(base_sla, 60)  # Complex may need faster initial response
        if classification.estimated_complexity == "simple":
            return 45
        return base_sla
