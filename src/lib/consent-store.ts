/**
 * In-memory mock store for consent lifecycle data.
 * Persists across requests within the same Node process.
 * Replace with database in production.
 */

import type { ConsentRecord, ConsentPurpose } from "@/types";

export interface ConsentArtifact {
  id: string;
  org_id: string;
  purpose_id: string;
  data_principal_id: string;
  session_id: string;
  timestamp: string;
  consent_method: ConsentRecord["consent_method"];
}

export interface AuditEntry {
  event_type: "granted" | "withdrawn" | "renewed" | "expired";
  consent_id: string;
  data_principal_id: string;
  purpose_id: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

// In-memory stores - module-level so they persist across requests
export const consentStore = new Map<string, ConsentRecord>();
export const purposeStore = new Map<string, ConsentPurpose>();
export const auditStore: AuditEntry[] = [];

// Default org for mock data when x-org-id header is not provided
export const DEFAULT_ORG_ID = "org_default_001";

export function addAuditEntry(entry: AuditEntry): void {
  auditStore.push(entry);
}
