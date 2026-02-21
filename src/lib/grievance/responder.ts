import { randomUUID } from "crypto";
import type {
  AIResponse,
  ClassificationResult,
  GrievanceRequest,
} from "./types";

const TEMPLATES: Record<string, string> = {
  erasure:
    "We acknowledge receipt of your request for erasure of your personal data. " +
    "Under Section 12(1) of the Digital Personal Data Protection Act, 2023 (DPDP Act), " +
    "you have the right to request erasure of personal data where it is no longer necessary " +
    "for the purpose for which it was collected, or where you have withdrawn consent. " +
    "We will process your erasure request within 90 days from the date of receipt. " +
    "Please note that certain data may be retained where required for compliance with legal obligations, " +
    "ongoing legal proceedings, or to establish, exercise, or defend legal claims. " +
    "You will receive a confirmation once the erasure process is complete.",
  access:
    "We acknowledge receipt of your request for access to your personal data. " +
    "Under Section 11 of the DPDP Act, 2023, you have the right to obtain a summary of " +
    "the personal data we hold and the processing activities undertaken. " +
    "We will provide you with the categories of data collected, purposes of processing, " +
    "and the data in a clear and concise format. You may request the data in PDF or JSON format. " +
    "We will respond to your access request within 90 days from the date of receipt. " +
    "You will receive a secure link to access your data once it is prepared.",
  correction:
    "We acknowledge receipt of your request for correction of your personal data. " +
    "Under Section 11(1)(a) of the DPDP Act, 2023, you have the right to correct inaccurate " +
    "or incomplete personal data. To process your request, we may require supporting documentation " +
    "to verify the corrections. We will review your submission and update our records accordingly. " +
    "You will receive confirmation of the correction within 90 days. " +
    "If we are unable to make the requested correction, we will provide reasons in writing.",
  portability:
    "We acknowledge receipt of your request for data portability. " +
    "Under Section 11(1)(b) of the DPDP Act, 2023, you have the right to receive your personal data " +
    "in a structured, commonly used, and machine-readable format. " +
    "We will provide your data in a format that supports interoperability (e.g., JSON, CSV) " +
    "to facilitate transfer to another data fiduciary. " +
    "We will process your portability request within 90 days. " +
    "You will receive a secure download link once your data package is ready.",
  objection:
    "We acknowledge receipt of your objection to the processing of your personal data. " +
    "Under the DPDP Act, 2023, you have the right to withdraw consent and object to processing " +
    "where consent was the legal basis. Please note that withdrawal of consent does not affect " +
    "the lawfulness of processing based on consent before its withdrawal. " +
    "Certain processing may continue under other legal bases such as compliance with law, " +
    "performance of a contract, or legitimate interests. " +
    "We will cease processing for consent-based activities within 90 days. " +
    "You will receive confirmation of the changes to our processing activities.",
};

export const TEMPLATE_TYPES = Object.keys(TEMPLATES);

function getSuggestedActions(
  classification: ClassificationResult,
): string[] {
  const actions: string[] = [];

  if (classification.requires_manual_review) {
    actions.push("Flag for manual review by compliance officer");
    actions.push("Verify data principal identity before processing");
  }

  switch (classification.request_type) {
    case "erasure":
      actions.push("Identify all systems holding the data principal's data");
      actions.push("Execute erasure workflow per retention policy");
      actions.push("Document erasure completion and retain audit trail");
      break;
    case "access":
      actions.push("Compile data summary from all relevant systems");
      actions.push("Prepare data in requested format (PDF/JSON)");
      actions.push("Send secure access link to data principal");
      break;
    case "correction":
      actions.push("Request supporting documentation if not provided");
      actions.push("Verify correction request against source documents");
      actions.push("Update records and notify downstream processors");
      break;
    case "portability":
      actions.push("Export data in machine-readable format");
      actions.push("Ensure format supports interoperability");
      actions.push("Provide secure download mechanism");
      break;
    case "objection":
      actions.push("Identify consent-based processing activities");
      actions.push("Cease processing for withdrawn consent");
      actions.push("Update consent records and notify data principal");
      break;
  }

  if (classification.priority === "high" || classification.priority === "critical") {
    actions.push("Prioritize in queue — expedite processing");
  }

  return actions;
}

function getSLADays(classification: ClassificationResult): number {
  if (classification.estimated_complexity === "complex") return 60;
  if (classification.estimated_complexity === "simple") return 45;
  return 90;
}

export function generateResponse(
  classification: ClassificationResult,
  request: GrievanceRequest,
): AIResponse {
  const template = TEMPLATES[classification.request_type] ?? TEMPLATES.access;
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const shortId = randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();

  return {
    case_id: `GRV-${dateStr}-${shortId}`,
    response_text: template,
    language: request.language ?? "en",
    suggested_actions: getSuggestedActions(classification),
    sla_days: getSLADays(classification),
    escalation_required: classification.requires_manual_review,
    generated_at: now.toISOString(),
  };
}
