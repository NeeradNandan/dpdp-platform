import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CORS_HEADERS } from "@/lib/cors";

const DEFAULT_ORG_ID = "org_default_001";

function getOrgId(request: NextRequest): string {
  return request.headers.get("x-org-id") ?? DEFAULT_ORG_ID;
}

function errorResponse(error: string, status: number, details?: string) {
  return NextResponse.json(
    { error, ...(details && { details }) },
    { status, headers: CORS_HEADERS }
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orgId = getOrgId(request);
    const supabase = createAdminClient();

    const { data: consent, error } = await supabase
      .from("consent_records")
      .select("*")
      .eq("id", id)
      .eq("org_id", orgId)
      .single();

    if (error || !consent) {
      return errorResponse("Consent not found", 404);
    }

    return NextResponse.json(consent, { headers: CORS_HEADERS });
  } catch (err) {
    return errorResponse(
      "Failed to get consent",
      500,
      err instanceof Error ? err.message : "Unknown error"
    );
  }
}

interface PatchBody {
  action: "withdraw" | "renew";
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orgId = getOrgId(request);
    const supabase = createAdminClient();

    const { data: consent, error: fetchError } = await supabase
      .from("consent_records")
      .select("*")
      .eq("id", id)
      .eq("org_id", orgId)
      .single();

    if (fetchError || !consent) {
      return errorResponse("Consent not found", 404);
    }

    let body: PatchBody;
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON body", 400);
    }

    const { action } = body;
    if (!action || (action !== "withdraw" && action !== "renew")) {
      return errorResponse(
        "action is required and must be 'withdraw' or 'renew'",
        400
      );
    }

    const now = new Date().toISOString();

    if (action === "withdraw") {
      if (consent.consent_status === "withdrawn") {
        return errorResponse("Consent is already withdrawn", 400);
      }

      const { data: updated, error: updateError } = await supabase
        .from("consent_records")
        .update({ consent_status: "withdrawn", withdrawn_at: now })
        .eq("id", id)
        .eq("org_id", orgId)
        .select()
        .single();

      if (updateError) {
        return errorResponse(
          "Failed to update consent",
          500,
          updateError.message
        );
      }

      return NextResponse.json(updated, { headers: CORS_HEADERS });
    } else {
      if (consent.consent_status !== "active") {
        return errorResponse("Only active consents can be renewed", 400);
      }

      const extendDays = 365;
      const newExpires = new Date(consent.expires_at ?? consent.granted_at);
      newExpires.setDate(newExpires.getDate() + extendDays);

      const { data: updated, error: updateError } = await supabase
        .from("consent_records")
        .update({ expires_at: newExpires.toISOString() })
        .eq("id", id)
        .eq("org_id", orgId)
        .select()
        .single();

      if (updateError) {
        return errorResponse(
          "Failed to update consent",
          500,
          updateError.message
        );
      }

      return NextResponse.json(updated, { headers: CORS_HEADERS });
    }
  } catch (err) {
    return errorResponse(
      "Failed to update consent",
      500,
      err instanceof Error ? err.message : "Unknown error"
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orgId = getOrgId(request);
    const supabase = createAdminClient();

    const { data: consent, error: fetchError } = await supabase
      .from("consent_records")
      .select("id")
      .eq("id", id)
      .eq("org_id", orgId)
      .single();

    if (fetchError || !consent) {
      return errorResponse("Consent not found", 404);
    }

    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("consent_records")
      .update({ consent_status: "withdrawn", withdrawn_at: now })
      .eq("id", id)
      .eq("org_id", orgId);

    if (updateError) {
      return errorResponse(
        "Failed to delete consent",
        500,
        updateError.message
      );
    }

    return NextResponse.json(
      { success: true, message: "Consent withdrawn" },
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    return errorResponse(
      "Failed to delete consent",
      500,
      err instanceof Error ? err.message : "Unknown error"
    );
  }
}
