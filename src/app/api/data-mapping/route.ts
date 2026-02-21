import { NextRequest, NextResponse } from "next/server";
import type { DataMapEntry } from "@/types";

const MOCK_ENTRIES: DataMapEntry[] = [
  {
    id: "1",
    org_id: "org-1",
    source_system: "PostgreSQL",
    table_or_collection: "users",
    field_name: "full_name",
    pii_type: "name",
    sensitivity: "medium",
    purpose_ids: ["p1"],
    retention_policy: "5 years",
    encryption_status: "encrypted",
    last_scanned: "2026-02-20T10:30:00Z",
  },
  {
    id: "2",
    org_id: "org-1",
    source_system: "PostgreSQL",
    table_or_collection: "users",
    field_name: "email",
    pii_type: "email",
    sensitivity: "medium",
    purpose_ids: ["p1"],
    retention_policy: "5 years",
    encryption_status: "encrypted",
    last_scanned: "2026-02-20T10:30:00Z",
  },
  {
    id: "3",
    org_id: "org-1",
    source_system: "PostgreSQL",
    table_or_collection: "users",
    field_name: "phone_number",
    pii_type: "phone",
    sensitivity: "high",
    purpose_ids: ["p1"],
    retention_policy: "5 years",
    encryption_status: "encrypted",
    last_scanned: "2026-02-20T10:30:00Z",
  },
  {
    id: "4",
    org_id: "org-1",
    source_system: "PostgreSQL",
    table_or_collection: "kyc_verification",
    field_name: "aadhaar_hash",
    pii_type: "aadhaar",
    sensitivity: "critical",
    purpose_ids: ["p2"],
    retention_policy: "7 years",
    encryption_status: "encrypted",
    last_scanned: "2026-02-19T14:00:00Z",
  },
  {
    id: "5",
    org_id: "org-1",
    source_system: "PostgreSQL",
    table_or_collection: "kyc_verification",
    field_name: "pan_number",
    pii_type: "pan",
    sensitivity: "critical",
    purpose_ids: ["p2"],
    retention_policy: "7 years",
    encryption_status: "encrypted",
    last_scanned: "2026-02-19T14:00:00Z",
  },
  {
    id: "6",
    org_id: "org-1",
    source_system: "PostgreSQL",
    table_or_collection: "users",
    field_name: "date_of_birth",
    pii_type: "dob",
    sensitivity: "high",
    purpose_ids: ["p1"],
    retention_policy: "5 years",
    encryption_status: "encrypted",
    last_scanned: "2026-02-20T10:30:00Z",
  },
  {
    id: "7",
    org_id: "org-1",
    source_system: "PostgreSQL",
    table_or_collection: "addresses",
    field_name: "street_address",
    pii_type: "address",
    sensitivity: "high",
    purpose_ids: ["p1"],
    retention_policy: "5 years",
    encryption_status: "partial",
    last_scanned: "2026-02-18T09:15:00Z",
  },
  {
    id: "8",
    org_id: "org-1",
    source_system: "PostgreSQL",
    table_or_collection: "payments",
    field_name: "bank_account_number",
    pii_type: "financial",
    sensitivity: "critical",
    purpose_ids: ["p3"],
    retention_policy: "10 years",
    encryption_status: "encrypted",
    last_scanned: "2026-02-19T11:00:00Z",
  },
  {
    id: "9",
    org_id: "org-1",
    source_system: "MongoDB",
    table_or_collection: "user_sessions",
    field_name: "device_fingerprint",
    pii_type: "other",
    sensitivity: "low",
    purpose_ids: ["p4"],
    retention_policy: "90 days",
    encryption_status: "unencrypted",
    last_scanned: "2026-02-17T16:45:00Z",
  },
  {
    id: "10",
    org_id: "org-1",
    source_system: "MongoDB",
    table_or_collection: "support_tickets",
    field_name: "customer_email",
    pii_type: "email",
    sensitivity: "medium",
    purpose_ids: ["p5"],
    retention_policy: "3 years",
    encryption_status: "encrypted",
    last_scanned: "2026-02-20T08:00:00Z",
  },
  {
    id: "11",
    org_id: "org-1",
    source_system: "Redis",
    table_or_collection: "session_cache",
    field_name: "user_id",
    pii_type: "other",
    sensitivity: "low",
    purpose_ids: ["p4"],
    retention_policy: "24 hours",
    encryption_status: "encrypted",
    last_scanned: "2026-02-20T12:00:00Z",
  },
  {
    id: "12",
    org_id: "org-1",
    source_system: "S3",
    table_or_collection: "documents",
    field_name: "aadhaar_document",
    pii_type: "aadhaar",
    sensitivity: "critical",
    purpose_ids: ["p2"],
    retention_policy: "7 years",
    encryption_status: "encrypted",
    last_scanned: "2026-02-19T09:30:00Z",
  },
  {
    id: "13",
    org_id: "org-1",
    source_system: "S3",
    table_or_collection: "invoices",
    field_name: "billing_address",
    pii_type: "address",
    sensitivity: "medium",
    purpose_ids: ["p3"],
    retention_policy: "7 years",
    encryption_status: "partial",
    last_scanned: "2026-02-18T14:20:00Z",
  },
  {
    id: "14",
    org_id: "org-1",
    source_system: "BigQuery",
    table_or_collection: "analytics_events",
    field_name: "user_email",
    pii_type: "email",
    sensitivity: "medium",
    purpose_ids: ["p6"],
    retention_policy: "2 years",
    encryption_status: "encrypted",
    last_scanned: "2026-02-20T06:00:00Z",
  },
  {
    id: "15",
    org_id: "org-1",
    source_system: "BigQuery",
    table_or_collection: "analytics_events",
    field_name: "ip_address",
    pii_type: "other",
    sensitivity: "low",
    purpose_ids: ["p6"],
    retention_policy: "2 years",
    encryption_status: "unencrypted",
    last_scanned: "2026-02-20T06:00:00Z",
  },
  {
    id: "16",
    org_id: "org-1",
    source_system: "PostgreSQL",
    table_or_collection: "health_records",
    field_name: "medical_history",
    pii_type: "health",
    sensitivity: "critical",
    purpose_ids: ["p7"],
    retention_policy: "15 years",
    encryption_status: "encrypted",
    last_scanned: "2026-02-19T13:00:00Z",
  },
  {
    id: "17",
    org_id: "org-1",
    source_system: "MongoDB",
    table_or_collection: "biometric_logs",
    field_name: "face_template",
    pii_type: "biometric",
    sensitivity: "critical",
    purpose_ids: ["p8"],
    retention_policy: "1 year",
    encryption_status: "encrypted",
    last_scanned: "2026-02-18T10:00:00Z",
  },
];

// In-memory store for POST additions (persists during server lifecycle)
let entriesStore = [...MOCK_ENTRIES];

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

/**
 * GET /api/data-mapping
 * List data map entries with optional filters: source_system, pii_type, sensitivity
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source_system = searchParams.get("source_system");
    const pii_type = searchParams.get("pii_type");
    const sensitivity = searchParams.get("sensitivity");

    let results = [...entriesStore];

    if (source_system) {
      results = results.filter((e) => e.source_system === source_system);
    }
    if (pii_type) {
      results = results.filter((e) => e.pii_type === pii_type);
    }
    if (sensitivity) {
      results = results.filter((e) => e.sensitivity === sensitivity);
    }

    return NextResponse.json({ items: results });
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

/**
 * POST /api/data-mapping
 * Add a new data map entry. Validates required fields.
 */
export async function POST(request: NextRequest) {
  try {
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

    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const entry: DataMapEntry = {
      id,
      org_id: "org-1",
      source_system,
      table_or_collection,
      field_name,
      pii_type: pii_type as DataMapEntry["pii_type"],
      sensitivity: sensitivity as DataMapEntry["sensitivity"],
      purpose_ids: Array.isArray(purpose_ids) ? purpose_ids : [],
      retention_policy,
      encryption_status: resolvedEncryption,
      last_scanned: now,
      notes,
    };

    entriesStore.push(entry);

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
