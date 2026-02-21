import { NextRequest, NextResponse } from "next/server";
import type { ConsentRecord } from "@/types";
import {
  consentStore,
  purposeStore,
  addAuditEntry,
  DEFAULT_ORG_ID,
} from "@/lib/consent-store";
import { CORS_HEADERS } from "@/lib/cors";

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

/**
 * GET /api/consent
 * List consents for the authenticated org with filters and pagination.
 */
export async function GET(request: NextRequest) {
  try {
    const orgId = getOrgId(request);
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

    let results = Array.from(consentStore.values()).filter(
      (c) => c.org_id === orgId
    );

    if (status) {
      results = results.filter((c) => c.consent_status === status);
    }
    if (purposeId) {
      results = results.filter((c) => c.purpose_id === purposeId);
    }
    if (dataPrincipalId) {
      results = results.filter((c) => c.data_principal_id === dataPrincipalId);
    }

    const total = results.length;
    const offset = (page - 1) * limit;
    const items = results.slice(offset, offset + limit);

    return jsonResponse({
      items,
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

/**
 * POST /api/consent
 * Record a new consent.
 */
export async function POST(request: NextRequest) {
  try {
    const orgId = getOrgId(request);
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

    const purpose = purposeStore.get(purpose_id);
    const purposeDescription = purpose?.title ?? "Unknown purpose";

    const now = new Date().toISOString();
    const consentId = crypto.randomUUID();

    const retentionDays = purpose?.retention_period_days ?? 365;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + retentionDays);

    const consentRecord: ConsentRecord = {
      id: consentId,
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
    };

    consentStore.set(consentId, consentRecord);

    addAuditEntry({
      event_type: "granted",
      consent_id: consentId,
      data_principal_id,
      purpose_id,
      timestamp: now,
      ip_address: body.ip_address,
      user_agent: body.user_agent,
    });

    const consentArtifact = {
      id: consentId,
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
