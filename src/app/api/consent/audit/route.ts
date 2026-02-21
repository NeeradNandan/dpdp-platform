import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CORS_HEADERS } from "@/lib/cors";

const DEFAULT_ORG_ID = "org_default_001";

function errorResponse(error: string, status: number, details?: string) {
  return NextResponse.json(
    { error, ...(details && { details }) },
    { status, headers: CORS_HEADERS }
  );
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const consentId = searchParams.get("consent_id");
    const orgId = request.headers.get("x-org-id") ?? DEFAULT_ORG_ID;
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");

    let query = supabase
      .from("consent_audit_log")
      .select("*")
      .eq("org_id", orgId);

    if (consentId) {
      query = query.eq("consent_id", consentId);
    }
    if (dateFrom) {
      query = query.gte("created_at", dateFrom);
    }
    if (dateTo) {
      query = query.lte("created_at", dateTo);
    }

    const { data: entries, error } = await query.order("created_at", {
      ascending: true,
    });

    if (error) {
      return errorResponse("Failed to fetch audit trail", 500, error.message);
    }

    return NextResponse.json(
      { entries: entries ?? [], total: entries?.length ?? 0 },
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    return errorResponse(
      "Failed to fetch audit trail",
      500,
      err instanceof Error ? err.message : "Unknown error"
    );
  }
}
