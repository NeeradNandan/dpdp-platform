import { NextRequest, NextResponse } from "next/server";
import type { GrievanceTicket } from "@/types";
import { generateCaseId, calculateSLADeadline } from "@/lib/utils";

const MOCK_GRIEVANCES: GrievanceTicket[] = [
  {
    id: "1",
    org_id: "org-1",
    case_id: "GRV-2026-A1B2C",
    data_principal_email: "rajesh.kumar@outlook.com",
    request_type: "access",
    status: "open",
    priority: "high",
    description:
      "I would like to request a copy of all my personal data that your organization holds. As per the DPDP Act 2023, I am entitled to access my data.",
    ai_classification: "access_request",
    sla_deadline: "2026-05-15T00:00:00Z",
    created_at: "2026-02-15T10:30:00Z",
    updated_at: "2026-02-15T10:30:00Z",
  },
  {
    id: "2",
    org_id: "org-1",
    case_id: "GRV-2026-D3E4F",
    data_principal_email: "priya.sharma@gmail.com",
    request_type: "correction",
    status: "in_progress",
    priority: "medium",
    description:
      "My phone number in your records is incorrect. Please update it to +91 9876543210.",
    ai_classification: "correction_request",
    assigned_to: "Amit Verma",
    sla_deadline: "2026-05-18T00:00:00Z",
    created_at: "2026-02-12T14:20:00Z",
    updated_at: "2026-02-20T09:00:00Z",
  },
  {
    id: "3",
    org_id: "org-1",
    case_id: "GRV-2026-G5H6I",
    data_principal_email: "sneha.patel@yahoo.co.in",
    request_type: "erasure",
    status: "awaiting_info",
    priority: "critical",
    description:
      "I want to delete all my personal data from your systems. Please process my erasure request as per the DPDP Act.",
    ai_classification: "erasure_request",
    sla_deadline: "2026-05-10T00:00:00Z",
    created_at: "2026-02-10T09:15:00Z",
    updated_at: "2026-02-18T11:30:00Z",
  },
  {
    id: "4",
    org_id: "org-1",
    case_id: "GRV-2026-J7K8L",
    data_principal_email: "vikram.singh@rediffmail.com",
    request_type: "portability",
    status: "resolved",
    priority: "low",
    description:
      "I need to transfer my data to another service provider. Please provide my data in a machine-readable format.",
    ai_classification: "portability_request",
    assigned_to: "Neha Gupta",
    sla_deadline: "2026-05-08T00:00:00Z",
    resolved_at: "2026-02-18T16:00:00Z",
    created_at: "2026-02-08T11:00:00Z",
    updated_at: "2026-02-18T16:00:00Z",
  },
  {
    id: "5",
    org_id: "org-1",
    case_id: "GRV-2026-M9N0O",
    data_principal_email: "anita.desai@hotmail.com",
    request_type: "objection",
    status: "open",
    priority: "high",
    description:
      "I object to my data being used for marketing purposes. Please stop all marketing communications.",
    ai_classification: "objection_request",
    sla_deadline: "2026-05-12T00:00:00Z",
    created_at: "2026-02-13T08:45:00Z",
    updated_at: "2026-02-13T08:45:00Z",
  },
  {
    id: "6",
    org_id: "org-1",
    case_id: "GRV-2026-P1Q2R",
    data_principal_email: "arun.menon@zoho.com",
    request_type: "access",
    status: "in_progress",
    priority: "medium",
    description:
      "Requesting access to my personal data including account details and transaction history.",
    ai_classification: "access_request",
    assigned_to: "Kavita Nair",
    sla_deadline: "2026-05-20T00:00:00Z",
    created_at: "2026-02-11T16:30:00Z",
    updated_at: "2026-02-19T10:15:00Z",
  },
  {
    id: "7",
    org_id: "org-1",
    case_id: "GRV-2026-S3T4U",
    data_principal_email: "meera.iyer@proton.me",
    request_type: "erasure",
    status: "open",
    priority: "critical",
    description:
      "Delete my account and all associated data. I want a complete erasure from your database.",
    ai_classification: "erasure_request",
    sla_deadline: "2026-05-11T00:00:00Z",
    created_at: "2026-02-10T13:00:00Z",
    updated_at: "2026-02-10T13:00:00Z",
  },
  {
    id: "8",
    org_id: "org-1",
    case_id: "GRV-2026-V5W6X",
    data_principal_email: "suresh.reddy@outlook.com",
    request_type: "correction",
    status: "resolved",
    priority: "low",
    description:
      "My address has changed. Please update: New address - 42 MG Road, Bangalore 560001.",
    ai_classification: "correction_request",
    assigned_to: "Rahul Joshi",
    sla_deadline: "2026-05-22T00:00:00Z",
    resolved_at: "2026-02-17T14:30:00Z",
    created_at: "2026-02-09T10:00:00Z",
    updated_at: "2026-02-17T14:30:00Z",
  },
  {
    id: "9",
    org_id: "org-1",
    case_id: "GRV-2026-Y7Z8A",
    data_principal_email: "latha.venkatesh@gmail.com",
    request_type: "access",
    status: "awaiting_info",
    priority: "medium",
    description:
      "I need to view what data you have collected about me for KYC verification.",
    ai_classification: "access_request",
    sla_deadline: "2026-05-19T00:00:00Z",
    created_at: "2026-02-12T09:00:00Z",
    updated_at: "2026-02-20T08:00:00Z",
  },
  {
    id: "10",
    org_id: "org-1",
    case_id: "GRV-2026-B9C0D",
    data_principal_email: "mohammed.rafiq@yahoo.com",
    request_type: "portability",
    status: "in_progress",
    priority: "high",
    description:
      "Transfer my financial transaction data to my new bank's app. Need CSV format.",
    ai_classification: "portability_request",
    assigned_to: "Deepa Krishnan",
    sla_deadline: "2026-05-14T00:00:00Z",
    created_at: "2026-02-14T11:20:00Z",
    updated_at: "2026-02-20T12:00:00Z",
  },
  {
    id: "11",
    org_id: "org-1",
    case_id: "GRV-2026-E1F2G",
    data_principal_email: "kavitha.nair@outlook.com",
    request_type: "objection",
    status: "resolved",
    priority: "medium",
    description:
      "Object to profiling. I don't want my data used for automated decision-making.",
    ai_classification: "objection_request",
    assigned_to: "Sandeep Rao",
    sla_deadline: "2026-05-16T00:00:00Z",
    resolved_at: "2026-02-19T15:00:00Z",
    created_at: "2026-02-11T14:00:00Z",
    updated_at: "2026-02-19T15:00:00Z",
  },
  {
    id: "12",
    org_id: "org-1",
    case_id: "GRV-2026-H3I4J",
    data_principal_email: "ramesh.pillai@rediffmail.com",
    request_type: "erasure",
    status: "in_progress",
    priority: "high",
    description:
      "Remove my data from your system. I am closing my account and want complete erasure.",
    ai_classification: "erasure_request",
    assigned_to: "Anjali Mehta",
    sla_deadline: "2026-05-13T00:00:00Z",
    created_at: "2026-02-13T16:45:00Z",
    updated_at: "2026-02-20T09:30:00Z",
  },
  {
    id: "13",
    org_id: "org-1",
    case_id: "GRV-2026-K5L6M",
    data_principal_email: "divya.chandran@zoho.com",
    request_type: "correction",
    status: "open",
    priority: "low",
    description:
      "My date of birth is wrong in your records. Correct it to 15 March 1990.",
    ai_classification: "correction_request",
    sla_deadline: "2026-05-25T00:00:00Z",
    created_at: "2026-02-08T12:00:00Z",
    updated_at: "2026-02-08T12:00:00Z",
  },
  {
    id: "14",
    org_id: "org-1",
    case_id: "GRV-2026-N7O8P",
    data_principal_email: "ganesh.murthy@gmail.com",
    request_type: "access",
    status: "resolved",
    priority: "medium",
    description:
      "Requested copy of my data. Need it for tax filing purposes.",
    ai_classification: "access_request",
    assigned_to: "Priya Sundaram",
    sla_deadline: "2026-05-05T00:00:00Z",
    resolved_at: "2026-02-16T11:00:00Z",
    created_at: "2026-02-06T10:00:00Z",
    updated_at: "2026-02-16T11:00:00Z",
  },
  {
    id: "15",
    org_id: "org-1",
    case_id: "GRV-2026-Q9R0S",
    data_principal_email: "indira.bose@hotmail.com",
    request_type: "portability",
    status: "awaiting_info",
    priority: "medium",
    description:
      "I want to port my health records to a new healthcare app. Please provide data in FHIR or JSON format.",
    ai_classification: "portability_request",
    sla_deadline: "2026-05-21T00:00:00Z",
    created_at: "2026-02-10T15:30:00Z",
    updated_at: "2026-02-19T14:00:00Z",
  },
  {
    id: "16",
    org_id: "org-1",
    case_id: "GRV-2026-T1U2V",
    data_principal_email: "balakrishnan.nair@proton.me",
    request_type: "objection",
    status: "in_progress",
    priority: "high",
    description:
      "I object to my data being shared with affiliates for cross-selling.",
    ai_classification: "objection_request",
    assigned_to: "Vikram Malhotra",
    sla_deadline: "2026-05-17T00:00:00Z",
    created_at: "2026-02-12T11:00:00Z",
    updated_at: "2026-02-20T10:00:00Z",
  },
];

// In-memory store for POST additions
let grievancesStore = [...MOCK_GRIEVANCES];

const VALID_REQUEST_TYPES = [
  "access",
  "correction",
  "erasure",
  "portability",
  "objection",
] as const;

const VALID_PRIORITIES = ["low", "medium", "high", "critical"] as const;

function autoClassify(description: string): string {
  const lower = description.toLowerCase();
  if (lower.includes("delete") || lower.includes("erase")) return "erasure_request";
  if (lower.includes("access") || lower.includes("view")) return "access_request";
  if (lower.includes("correct") || lower.includes("update")) return "correction_request";
  if (lower.includes("transfer") || lower.includes("port")) return "portability_request";
  if (lower.includes("object") || lower.includes("stop") || lower.includes("withdraw"))
    return "objection_request";
  return "general_request";
}

interface CreateGrievanceBody {
  data_principal_email: string;
  request_type: string;
  description: string;
  priority?: string;
}

/**
 * GET /api/grievances
 * List grievance tickets with optional filters: status, priority, request_type
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const request_type = searchParams.get("request_type");

    let results = [...grievancesStore];

    if (status) {
      results = results.filter((g) => g.status === status);
    }
    if (priority) {
      results = results.filter((g) => g.priority === priority);
    }
    if (request_type) {
      results = results.filter((g) => g.request_type === request_type);
    }

    return NextResponse.json({ items: results });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to list grievances",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/grievances
 * Create a new grievance. Auto-generates case_id, sla_deadline (90 days), and ai_classification.
 */
export async function POST(request: NextRequest) {
  try {
    let body: CreateGrievanceBody;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const {
      data_principal_email,
      request_type,
      description,
      priority = "medium",
    } = body;

    if (!data_principal_email || typeof data_principal_email !== "string") {
      return NextResponse.json(
        { error: "data_principal_email is required" },
        { status: 400 }
      );
    }
    if (!request_type || typeof request_type !== "string") {
      return NextResponse.json(
        { error: "request_type is required" },
        { status: 400 }
      );
    }
    if (!VALID_REQUEST_TYPES.includes(request_type as (typeof VALID_REQUEST_TYPES)[number])) {
      return NextResponse.json(
        {
          error:
            "request_type must be one of: " + VALID_REQUEST_TYPES.join(", "),
        },
        { status: 400 }
      );
    }
    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "description is required" },
        { status: 400 }
      );
    }

    const resolvedPriority = VALID_PRIORITIES.includes(
      priority as (typeof VALID_PRIORITIES)[number]
    )
      ? (priority as GrievanceTicket["priority"])
      : "medium";

    const now = new Date().toISOString();
    const caseId = generateCaseId();
    const slaDeadline = calculateSLADeadline(now, 90);
    const aiClassification = autoClassify(description);

    const ticket: GrievanceTicket = {
      id: crypto.randomUUID(),
      org_id: "org-1",
      case_id: caseId,
      data_principal_email,
      request_type: request_type as GrievanceTicket["request_type"],
      status: "open",
      priority: resolvedPriority,
      description,
      ai_classification: aiClassification,
      sla_deadline: slaDeadline,
      created_at: now,
      updated_at: now,
    };

    grievancesStore.push(ticket);

    return NextResponse.json(ticket, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to create grievance",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
