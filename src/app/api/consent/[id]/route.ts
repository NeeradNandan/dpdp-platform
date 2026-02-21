import { NextRequest, NextResponse } from "next/server";
import {
  consentStore,
  addAuditEntry,
  DEFAULT_ORG_ID,
} from "@/lib/consent-store";
import { CORS_HEADERS } from "@/lib/cors";

function getOrgId(request: NextRequest): string {
  return request.headers.get("x-org-id") ?? DEFAULT_ORG_ID;
}

function errorResponse(error: string, status: number, details?: string) {
  return NextResponse.json(
    { error, ...(details && { details }) },
    { status, headers: CORS_HEADERS }
  );
}

/**
 * GET /api/consent/[id]
 * Get a single consent record by ID.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orgId = getOrgId(request);

    const consent = consentStore.get(id);
    if (!consent) {
      return errorResponse("Consent not found", 404);
    }
    if (consent.org_id !== orgId) {
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

/**
 * PATCH /api/consent/[id]
 * Update consent (withdraw or renew).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orgId = getOrgId(request);

    const consent = consentStore.get(id);
    if (!consent) {
      return errorResponse("Consent not found", 404);
    }
    if (consent.org_id !== orgId) {
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
      consent.consent_status = "withdrawn";
      consent.withdrawn_at = now;

      addAuditEntry({
        event_type: "withdrawn",
        consent_id: id,
        data_principal_id: consent.data_principal_id,
        purpose_id: consent.purpose_id,
        timestamp: now,
        ip_address: consent.ip_address,
        user_agent: consent.user_agent,
      });
    } else {
      // renew
      if (consent.consent_status !== "active") {
        return errorResponse("Only active consents can be renewed", 400);
      }
      const extendDays = 365;
      const newExpires = new Date(consent.expires_at ?? consent.granted_at);
      newExpires.setDate(newExpires.getDate() + extendDays);
      consent.expires_at = newExpires.toISOString();

      addAuditEntry({
        event_type: "renewed",
        consent_id: id,
        data_principal_id: consent.data_principal_id,
        purpose_id: consent.purpose_id,
        timestamp: now,
        ip_address: request.headers.get("x-forwarded-for") ?? undefined,
        user_agent: request.headers.get("user-agent") ?? undefined,
      });
    }

    return NextResponse.json(consent, { headers: CORS_HEADERS });
  } catch (err) {
    return errorResponse(
      "Failed to update consent",
      500,
      err instanceof Error ? err.message : "Unknown error"
    );
  }
}

/**
 * DELETE /api/consent/[id]
 * Soft-delete (mark as withdrawn).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orgId = getOrgId(request);

    const consent = consentStore.get(id);
    if (!consent) {
      return errorResponse("Consent not found", 404);
    }
    if (consent.org_id !== orgId) {
      return errorResponse("Consent not found", 404);
    }

    const now = new Date().toISOString();
    consent.consent_status = "withdrawn";
    consent.withdrawn_at = now;

    addAuditEntry({
      event_type: "withdrawn",
      consent_id: id,
      data_principal_id: consent.data_principal_id,
      purpose_id: consent.purpose_id,
      timestamp: now,
      ip_address: request.headers.get("x-forwarded-for") ?? undefined,
      user_agent: request.headers.get("user-agent") ?? undefined,
    });

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
