import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CORS_HEADERS } from "@/lib/cors";

const DEFAULT_ORG_ID = "org_default_001";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

function getOrgId(request: NextRequest): string {
  return (
    request.headers.get("x-org-id") ??
    request.headers.get("X-Org-Id") ??
    DEFAULT_ORG_ID
  );
}

function errorResponse(error: string, status: number, details?: string) {
  return NextResponse.json(
    { error, ...(details && { details }) },
    { status, headers: CORS_HEADERS }
  );
}

interface ValidateBody {
  data_principal_id: string;
  purpose_id: string;
  org_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    let body: ValidateBody;
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON body", 400);
    }

    const { data_principal_id, purpose_id, org_id } = body;

    if (!data_principal_id || typeof data_principal_id !== "string") {
      return errorResponse("data_principal_id is required", 400);
    }
    if (!purpose_id || typeof purpose_id !== "string") {
      return errorResponse("purpose_id is required", 400);
    }

    const targetOrgId = org_id ?? getOrgId(request);

    const { data: consents } = await supabase
      .from("consent_records")
      .select("*")
      .eq("org_id", targetOrgId)
      .eq("data_principal_id", data_principal_id)
      .eq("purpose_id", purpose_id)
      .eq("consent_status", "active");

    const now = new Date();
    const activeConsent = (consents ?? []).find((c) => {
      if (!c.expires_at) return true;
      return new Date(c.expires_at) > now;
    });

    const { data: purpose } = await supabase
      .from("consent_purposes")
      .select("title")
      .eq("id", purpose_id)
      .single();

    if (!activeConsent) {
      return NextResponse.json(
        {
          valid: false,
          purpose_description: purpose?.title,
        },
        { headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      {
        valid: true,
        consent_id: activeConsent.id,
        expires_at: activeConsent.expires_at,
        purpose_description:
          activeConsent.purpose_description ?? purpose?.title,
      },
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    return errorResponse(
      "Failed to validate consent",
      500,
      err instanceof Error ? err.message : "Unknown error"
    );
  }
}
