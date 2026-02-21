import {
  consentStore,
  purposeStore,
  auditStore,
  addAuditEntry,
  DEFAULT_ORG_ID,
} from "../consent-store";
import type { AuditEntry } from "../consent-store";

beforeEach(() => {
  consentStore.clear();
  purposeStore.clear();
  auditStore.length = 0;
});

describe("consent-store", () => {
  it("exports empty stores by default", () => {
    expect(consentStore.size).toBe(0);
    expect(purposeStore.size).toBe(0);
    expect(auditStore).toHaveLength(0);
  });

  it("has a default org ID", () => {
    expect(DEFAULT_ORG_ID).toBe("org_default_001");
  });
});

describe("addAuditEntry", () => {
  it("appends an entry to the audit store", () => {
    const entry: AuditEntry = {
      event_type: "granted",
      consent_id: "c-1",
      data_principal_id: "dp-1",
      purpose_id: "p-1",
      timestamp: new Date().toISOString(),
    };

    addAuditEntry(entry);
    expect(auditStore).toHaveLength(1);
    expect(auditStore[0]).toEqual(entry);
  });

  it("preserves insertion order across multiple entries", () => {
    const ts = new Date().toISOString();
    addAuditEntry({ event_type: "granted", consent_id: "c-1", data_principal_id: "dp-1", purpose_id: "p-1", timestamp: ts });
    addAuditEntry({ event_type: "withdrawn", consent_id: "c-1", data_principal_id: "dp-1", purpose_id: "p-1", timestamp: ts });

    expect(auditStore).toHaveLength(2);
    expect(auditStore[0].event_type).toBe("granted");
    expect(auditStore[1].event_type).toBe("withdrawn");
  });
});
