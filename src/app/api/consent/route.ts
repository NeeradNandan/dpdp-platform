import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CORS_HEADERS } from "@/lib/cors";

const DEFAULT_ORG_ID = "org_default_001";

function getOrgId(request: NextRequest): string {
  return request.headers.get("x-org-id") ?? DEFAULT_ORG_ID;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function jsonResponse<T>(data: T, status = 200, init?: ResponseInit) {
  return NextResponse.json(data, {
    status,
    headers: CORS_HEADERS,
    ...init,
  });
}

function errorResponse(error: string, status: number, details?: string) {
  return NextResponse.json(
    { error, ...(details && { details }) },
    { status, headers: CORS_HEADERS }
  );
}

export async function GET(request: NextRequest) {
  try {
    const orgId = getOrgId(request);
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status") as
      | "active"
      | "withdrawn"
      | "expired"
      | null;
    const purposeId = searchParams.get("purpose_id");
    const dataPrincipalId = searchParams.get("data_principal_id");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10))
    );

    const offset = (page - 1) * limit;

    let query = supabase
      .from("consent_records")
      .select("*", { count: "exact" })
      .eq("org_id", orgId);

    if (status) {
      query = query.eq("consent_status", status);
    }
    if (purposeId) {
      query = query.eq("purpose_id", purposeId);
    }
    if (dataPrincipalId) {
      query = query.eq("data_principal_id", dataPrincipalId);
    }

    const { data: items, count, error } = await query.range(
      offset,
      offset + limit - 1
    );

    if (error) {
      return errorResponse("Failed to list consents", 500, error.message);
    }

    const total = count ?? 0;

    return jsonResponse({
      items: items ?? [],
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return errorResponse(
      "Failed to list consents",
      500,
      err instanceof Error ? err.message : "Unknown error"
    );
  }
}

interface CreateConsentBody {
  data_principal_id: string;
  purpose_id: string;
  consent_method: "explicit_click" | "toggle" | "form_submission";
  session_id: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const orgId = getOrgId(request);
    const supabase = createAdminClient();
    let body: CreateConsentBody;

    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON body", 400);
    }

    const { data_principal_id, purpose_id, consent_method, session_id } = body;

    if (!data_principal_id || typeof data_principal_id !== "string") {
      return errorResponse("data_principal_id is required", 400);
    }
    if (!purpose_id || typeof purpose_id !== "string") {
      return errorResponse("purpose_id is required", 400);
    }
    if (!consent_method || typeof consent_method !== "string") {
      return errorResponse("consent_method is required", 400);
    }
    const validMethods = ["explicit_click", "toggle", "form_submission"];
    if (!validMethods.includes(consent_method)) {
      return errorResponse(
        "consent_method must be one of: explicit_click, toggle, form_submission",
        400
      );
    }
    if (!session_id || typeof session_id !== "string") {
      return errorResponse("session_id is required", 400);
    }

    const { data: purpose } = await supabase
      .from("consent_purposes")
      .select("title, retention_period_days")
      .eq("id", purpose_id)
      .single();

    const purposeDescription = purpose?.title ?? "Unknown purpose";
    const retentionDays = purpose?.retention_period_days ?? 365;

    const now = new Date().toISOString();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + retentionDays);

    const { data: consentRecord, error } = await supabase
      .from("consent_records")
      .insert({
        org_id: orgId,
        data_principal_id,
        purpose_id,
        purpose_description: purposeDescription,
        consent_status: "active",
        consent_method,
        session_id,
        ip_address: body.ip_address,
        user_agent: body.user_agent,
        granted_at: now,
        expires_at: expiresAt.toISOString(),
        metadata: body.metadata ?? {},
      })
      .select()
      .single();

    if (error) {
      return errorResponse("Failed to create consent", 500, error.message);
    }

    const consentArtifact = {
      id: consentRecord.id,
      org_id: orgId,
      purpose_id,
      data_principal_id,
      session_id,
      timestamp: now,
      consent_method,
    };

    return jsonResponse(
      {
        ...consentRecord,
        consent_artifact: consentArtifact,
      },
      201
    );
  } catch (err) {
    return errorResponse(
      "Failed to create consent",
      500,
      err instanceof Error ? err.message : "Unknown error"
    );
  }
}
