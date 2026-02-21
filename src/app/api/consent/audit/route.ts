import { NextRequest, NextResponse } from "next/server";
import { auditStore, DEFAULT_ORG_ID } from "@/lib/consent-store";
import { CORS_HEADERS } from "@/lib/cors";

function errorResponse(error: string, status: number, details?: string) {
  return NextResponse.json(
    { error, ...(details && { details }) },
    { status, headers: CORS_HEADERS }
  );
}

/**
 * GET /api/consent/audit
 * Return the full audit trail for consent events.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const consentId = searchParams.get("consent_id");
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");

    let results = [...auditStore];

    if (consentId) {
      results = results.filter((e) => e.consent_id === consentId);
    }
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      results = results.filter((e) => new Date(e.timestamp).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime();
      results = results.filter((e) => new Date(e.timestamp).getTime() <= to);
    }

    // Sort chronologically (oldest first)
    results.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return NextResponse.json(
      { entries: results, total: results.length },
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
