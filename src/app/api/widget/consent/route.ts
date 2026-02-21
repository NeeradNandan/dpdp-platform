import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CORS_HEADERS } from "@/lib/cors";

/**
 * Widget consent intake endpoint.
 * Accepts the ConsentArtifact format from the embedded widget
 * and fans out into individual consent_records per purpose.
 */

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

interface PurposeConsent {
  id: string;
  granted: boolean;
}

interface WidgetArtifact {
  consent_id: string;
  org_id: string;
  purposes: PurposeConsent[];
  timestamp: string;
  session_id: string;
  user_agent: string;
}

export async function POST(request: NextRequest) {
  try {
    let body: WidgetArtifact;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const { org_id, purposes, session_id, user_agent, timestamp } = body;

    if (!org_id || typeof org_id !== "string") {
      return NextResponse.json(
        { error: "org_id is required" },
        { status: 400, headers: CORS_HEADERS },
      );
    }
    if (!Array.isArray(purposes) || purposes.length === 0) {
      return NextResponse.json(
        { error: "purposes array is required" },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const supabase = createAdminClient();
    const dataPrincipalId = `widget_${session_id ?? "anon"}`;
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const grantedAt = timestamp ?? new Date().toISOString();

    const { data: orgPurposes } = await supabase
      .from("consent_purposes")
      .select("id, code, title, retention_period_days")
      .eq("org_id", org_id);

    const purposeMap = new Map(
      (orgPurposes ?? []).map((p) => [p.code, p]),
    );

    const results: Array<{ purpose: string; action: string; id?: string }> = [];

    for (const pc of purposes) {
      const dbPurpose = purposeMap.get(pc.id);
      if (!dbPurpose) {
        results.push({ purpose: pc.id, action: "skipped_unknown" });
        continue;
      }

      if (pc.granted) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (dbPurpose.retention_period_days ?? 365));

        const { data: record, error } = await supabase
          .from("consent_records")
          .insert({
            org_id,
            data_principal_id: dataPrincipalId,
            purpose_id: dbPurpose.id,
            purpose_description: dbPurpose.title,
            consent_status: "active",
            consent_method: "explicit_click",
            session_id: session_id ?? "",
            ip_address: ip,
            user_agent: user_agent ?? "",
            granted_at: grantedAt,
            expires_at: expiresAt.toISOString(),
            metadata: {},
          })
          .select("id")
          .single();

        if (error) {
          results.push({ purpose: pc.id, action: "error" });
        } else {
          results.push({ purpose: pc.id, action: "granted", id: record.id });
        }
      } else {
        results.push({ purpose: pc.id, action: "rejected" });
      }
    }

    return NextResponse.json(
      { ok: true, processed: results.length, results },
      { status: 201, headers: CORS_HEADERS },
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to process consent", details: err instanceof Error ? err.message : "Unknown" },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
