import { NextRequest, NextResponse } from "next/server";
import type { DataMapEntry } from "@/types";
import { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function getAuthOrgId(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: membership } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();
  return membership?.org_id ?? null;
}

const VALID_PII_TYPES = [
  "name",
  "email",
  "phone",
  "address",
  "aadhaar",
  "pan",
  "dob",
  "biometric",
  "financial",
  "health",
  "other",
] as const;

const VALID_SENSITIVITY = ["low", "medium", "high", "critical"] as const;

const VALID_ENCRYPTION = ["encrypted", "unencrypted", "partial"] as const;

interface CreateDataMapBody {
  source_system: string;
  table_or_collection: string;
  field_name: string;
  pii_type: string;
  sensitivity: string;
  purpose_ids?: string[];
  retention_policy?: string;
  encryption_status?: string;
  notes?: string;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const orgId = await getAuthOrgId(supabase);
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const source_system = searchParams.get("source_system");
    const pii_type = searchParams.get("pii_type");
    const sensitivity = searchParams.get("sensitivity");

    let query = supabase
      .from("data_map_entries")
      .select("*")
      .eq("org_id", orgId);

    if (source_system) {
      query = query.eq("source_system", source_system);
    }
    if (pii_type) {
      query = query.eq("pii_type", pii_type);
    }
    if (sensitivity) {
      query = query.eq("sensitivity", sensitivity);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "Failed to list data map entries", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ items: data });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to list data map entries",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const orgId = await getAuthOrgId(supabase);
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: CreateDataMapBody;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const {
      source_system,
      table_or_collection,
      field_name,
      pii_type,
      sensitivity,
      purpose_ids = [],
      retention_policy = "Not specified",
      encryption_status = "unencrypted",
      notes,
    } = body;

    if (!source_system || typeof source_system !== "string") {
      return NextResponse.json(
        { error: "source_system is required" },
        { status: 400 }
      );
    }
    if (!table_or_collection || typeof table_or_collection !== "string") {
      return NextResponse.json(
        { error: "table_or_collection is required" },
        { status: 400 }
      );
    }
    if (!field_name || typeof field_name !== "string") {
      return NextResponse.json(
        { error: "field_name is required" },
        { status: 400 }
      );
    }
    if (!pii_type || typeof pii_type !== "string") {
      return NextResponse.json(
        { error: "pii_type is required" },
        { status: 400 }
      );
    }
    if (!VALID_PII_TYPES.includes(pii_type as (typeof VALID_PII_TYPES)[number])) {
      return NextResponse.json(
        {
          error: "pii_type must be one of: " + VALID_PII_TYPES.join(", "),
        },
        { status: 400 }
      );
    }
    if (!sensitivity || typeof sensitivity !== "string") {
      return NextResponse.json(
        { error: "sensitivity is required" },
        { status: 400 }
      );
    }
    if (
      !VALID_SENSITIVITY.includes(sensitivity as (typeof VALID_SENSITIVITY)[number])
    ) {
      return NextResponse.json(
        {
          error:
            "sensitivity must be one of: " + VALID_SENSITIVITY.join(", "),
        },
        { status: 400 }
      );
    }

    const resolvedEncryption = VALID_ENCRYPTION.includes(
      encryption_status as (typeof VALID_ENCRYPTION)[number]
    )
      ? (encryption_status as DataMapEntry["encryption_status"])
      : "unencrypted";

    const { data: entry, error } = await supabase
      .from("data_map_entries")
      .insert({
        org_id: orgId,
        source_system,
        table_or_collection,
        field_name,
        pii_type,
        sensitivity,
        purpose_ids: Array.isArray(purpose_ids) ? purpose_ids : [],
        retention_policy,
        encryption_status: resolvedEncryption,
        last_scanned: new Date().toISOString(),
        notes,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create data map entry", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(entry, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to create data map entry",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
