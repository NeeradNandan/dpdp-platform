/**
 * @jest-environment node
 *
 * Integration tests for /api/consent
 * Tests the full consent lifecycle: create, list, filter, pagination.
 */
import { NextRequest } from "next/server";
import { GET, POST } from "../route";
import { consentStore, purposeStore } from "@/lib/consent-store";

function makeRequest(url: string, init?: { method?: string; body?: string; headers?: Record<string, string> }): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"), init);
}

beforeEach(() => {
  consentStore.clear();
  purposeStore.clear();
});

describe("POST /api/consent", () => {
  const validBody = {
    data_principal_id: "user-123",
    purpose_id: "purpose-analytics",
    consent_method: "explicit_click",
    session_id: "sess-abc",
  };

  it("creates a consent record and returns 201", async () => {
    const req = makeRequest("http://localhost:3000/api/consent", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.id).toBeDefined();
    expect(data.consent_status).toBe("active");
    expect(data.data_principal_id).toBe("user-123");
    expect(data.consent_artifact).toBeDefined();
    expect(data.consent_artifact.consent_method).toBe("explicit_click");
  });

  it("returns 400 for missing data_principal_id", async () => {
    const req = makeRequest("http://localhost:3000/api/consent", {
      method: "POST",
      body: JSON.stringify({ ...validBody, data_principal_id: "" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toContain("data_principal_id");
  });

  it("returns 400 for invalid consent_method", async () => {
    const req = makeRequest("http://localhost:3000/api/consent", {
      method: "POST",
      body: JSON.stringify({ ...validBody, consent_method: "magic" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("consent_method");
  });

  it("returns 400 for invalid JSON", async () => {
    const req = makeRequest("http://localhost:3000/api/consent", {
      method: "POST",
      body: "not-json",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("generates an expiry date in the future", async () => {
    const req = makeRequest("http://localhost:3000/api/consent", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(new Date(data.expires_at).getTime()).toBeGreaterThan(Date.now());
  });

  it("uses purpose title from store if available", async () => {
    purposeStore.set("purpose-analytics", {
      id: "purpose-analytics",
      org_id: "org_default_001",
      code: "ANALYTICS",
      title: "Website Analytics",
      description: "Track usage patterns",
      legal_basis: "consent",
      retention_period_days: 180,
      is_mandatory: false,
      created_at: new Date().toISOString(),
    });

    const req = makeRequest("http://localhost:3000/api/consent", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(data.purpose_description).toBe("Website Analytics");
  });
});

describe("GET /api/consent", () => {
  async function seedConsent(overrides: Record<string, unknown> = {}) {
    const body = {
      data_principal_id: "user-123",
      purpose_id: "p-1",
      consent_method: "explicit_click",
      session_id: "sess-1",
      ...overrides,
    };
    const req = makeRequest("http://localhost:3000/api/consent", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return POST(req);
  }

  it("returns empty list when no consents exist", async () => {
    const req = makeRequest("http://localhost:3000/api/consent");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.items).toHaveLength(0);
    expect(data.pagination.total).toBe(0);
  });

  it("lists created consents", async () => {
    await seedConsent();
    await seedConsent({ data_principal_id: "user-456" });

    const req = makeRequest("http://localhost:3000/api/consent");
    const res = await GET(req);
    const data = await res.json();

    expect(data.items).toHaveLength(2);
    expect(data.pagination.total).toBe(2);
  });

  it("filters by status", async () => {
    await seedConsent();

    const req = makeRequest("http://localhost:3000/api/consent?status=withdrawn");
    const res = await GET(req);
    const data = await res.json();

    expect(data.items).toHaveLength(0);
  });

  it("paginates results", async () => {
    for (let i = 0; i < 5; i++) {
      await seedConsent({ data_principal_id: `user-${i}` });
    }

    const req = makeRequest("http://localhost:3000/api/consent?page=2&limit=2");
    const res = await GET(req);
    const data = await res.json();

    expect(data.items).toHaveLength(2);
    expect(data.pagination.page).toBe(2);
    expect(data.pagination.total_pages).toBe(3);
  });

  it("clamps limit to max 100", async () => {
    const req = makeRequest("http://localhost:3000/api/consent?limit=500");
    const res = await GET(req);
    const data = await res.json();
    expect(data.pagination.limit).toBe(100);
  });
});
