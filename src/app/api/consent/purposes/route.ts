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

export async function GET(request: NextRequest) {
  try {
    const orgId = getOrgId(request);
    const supabase = createAdminClient();

    const { data: purposes, error } = await supabase
      .from("consent_purposes")
      .select("*")
      .eq("org_id", orgId);

    if (error) {
      return errorResponse("Failed to list purposes", 500, error.message);
    }

    return NextResponse.json(
      { purposes: purposes ?? [], total: purposes?.length ?? 0 },
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

export async function POST(request: NextRequest) {
  try {
    const orgId = getOrgId(request);
    const supabase = createAdminClient();
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
      return errorResponse(
        "is_mandatory is required and must be a boolean",
        400
      );
    }

    const { data: existingByCode } = await supabase
      .from("consent_purposes")
      .select("id")
      .eq("org_id", orgId)
      .ilike("code", code)
      .limit(1)
      .single();

    if (existingByCode) {
      return errorResponse(
        `Purpose with code '${code}' already exists`,
        400
      );
    }

    const { data: purpose, error } = await supabase
      .from("consent_purposes")
      .insert({
        org_id: orgId,
        code: code.trim(),
        title: title.trim(),
        description: description.trim(),
        legal_basis: legal_basis.trim(),
        retention_period_days,
        is_mandatory,
      })
      .select()
      .single();

    if (error) {
      return errorResponse("Failed to create purpose", 500, error.message);
    }

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
