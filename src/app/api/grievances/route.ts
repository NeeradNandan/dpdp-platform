import { NextRequest, NextResponse } from "next/server";
import type { GrievanceTicket } from "@/types";
import { generateCaseId, calculateSLADeadline } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function getAuthOrgId(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: membership } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();
  return membership?.org_id ?? null;
}

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

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const orgId = await getAuthOrgId(supabase);
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const request_type = searchParams.get("request_type");

    let query = supabase
      .from("grievance_tickets")
      .select("*")
      .eq("org_id", orgId);

    if (status) {
      query = query.eq("status", status);
    }
    if (priority) {
      query = query.eq("priority", priority);
    }
    if (request_type) {
      query = query.eq("request_type", request_type);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "Failed to list grievances", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ items: data });
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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const orgId = await getAuthOrgId(supabase);
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const { data: ticket, error } = await supabase
      .from("grievance_tickets")
      .insert({
        org_id: orgId,
        case_id: caseId,
        data_principal_email,
        request_type,
        status: "open",
        priority: resolvedPriority,
        description,
        ai_classification: aiClassification,
        sla_deadline: slaDeadline,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create grievance", details: error.message },
        { status: 500 }
      );
    }

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
