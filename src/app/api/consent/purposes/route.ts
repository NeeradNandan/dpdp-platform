import { NextRequest, NextResponse } from "next/server";
import type { ConsentPurpose } from "@/types";
import { purposeStore, DEFAULT_ORG_ID } from "@/lib/consent-store";
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
 * GET /api/consent/purposes
 * List all consent purposes for the org.
 */
export async function GET(request: NextRequest) {
  try {
    const orgId = getOrgId(request);

    const purposes = Array.from(purposeStore.values()).filter(
      (p) => p.org_id === orgId
    );

    return NextResponse.json(
      { purposes, total: purposes.length },
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    return errorResponse(
      "Failed to list purposes",
      500,
      err instanceof Error ? err.message : "Unknown error"
    );
  }
}

interface CreatePurposeBody {
  code: string;
  title: string;
  description: string;
  legal_basis: string;
  retention_period_days: number;
  is_mandatory: boolean;
}

/**
 * POST /api/consent/purposes
 * Create a new consent purpose.
 */
export async function POST(request: NextRequest) {
  try {
    const orgId = getOrgId(request);
    let body: CreatePurposeBody;

    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON body", 400);
    }

    const {
      code,
      title,
      description,
      legal_basis,
      retention_period_days,
      is_mandatory,
    } = body;

    if (!code || typeof code !== "string") {
      return errorResponse("code is required", 400);
    }
    if (!title || typeof title !== "string") {
      return errorResponse("title is required", 400);
    }
    if (!description || typeof description !== "string") {
      return errorResponse("description is required", 400);
    }
    if (!legal_basis || typeof legal_basis !== "string") {
      return errorResponse("legal_basis is required", 400);
    }
    if (
      typeof retention_period_days !== "number" ||
      retention_period_days < 0
    ) {
      return errorResponse(
        "retention_period_days is required and must be a non-negative number",
        400
      );
    }
    if (typeof is_mandatory !== "boolean") {
      return errorResponse("is_mandatory is required and must be a boolean", 400);
    }

    const existingByCode = Array.from(purposeStore.values()).find(
      (p) => p.org_id === orgId && p.code.toLowerCase() === code.toLowerCase()
    );
    if (existingByCode) {
      return errorResponse(`Purpose with code '${code}' already exists`, 400);
    }

    const now = new Date().toISOString();
    const purposeId = crypto.randomUUID();

    const purpose: ConsentPurpose = {
      id: purposeId,
      org_id: orgId,
      code: code.trim(),
      title: title.trim(),
      description: description.trim(),
      legal_basis: legal_basis.trim(),
      retention_period_days,
      is_mandatory,
      created_at: now,
    };

    purposeStore.set(purposeId, purpose);

    return NextResponse.json(purpose, {
      status: 201,
      headers: CORS_HEADERS,
    });
  } catch (err) {
    return errorResponse(
      "Failed to create purpose",
      500,
      err instanceof Error ? err.message : "Unknown error"
    );
  }
}
