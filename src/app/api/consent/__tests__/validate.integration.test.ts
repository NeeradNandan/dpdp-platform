/**
 * @jest-environment node
 *
 * Integration tests for /api/consent/validate
 * Tests real-time consent validation per MeitY BRD.
 * Mocks the Supabase admin client.
 */
import { NextRequest } from "next/server";
import { POST } from "../validate/route";

interface Row {
  id: string;
  [key: string]: unknown;
}

let consentRows: Row[] = [];
let purposeRows: Row[] = [];

function resetStore() {
  consentRows = [];
  purposeRows = [];
}

function mockChain(table: string) {
  const ctx: {
    table: string;
    filters: Array<{ col: string; val: unknown }>;
  } = { table, filters: [] };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const chain: Record<string, any> = {
    select() { return chain; },
    eq(col: any, val: any) {
      ctx.filters.push({ col, val });
      return chain;
    },
    single() {
      const src = ctx.table === "consent_purposes" ? purposeRows : consentRows;
      let result = src;
      for (const f of ctx.filters) {
        result = result.filter((r) => r[f.col] === f.val);
      }
      return { data: result[0] ?? null, error: null };
    },
  };

  chain.then = (resolve: any) => {
    const src = ctx.table === "consent_purposes" ? purposeRows : consentRows;
    let result = src;
    for (const f of ctx.filters) {
      result = result.filter((r) => r[f.col] === f.val);
    }
    return resolve({ data: result, error: null });
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return chain;
}

jest.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => mockChain(table),
  }),
}));

function makeRequest(
  url: string,
  init?: { method?: string; body?: string },
): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"), init);
}

beforeEach(() => {
  resetStore();
});

describe("POST /api/consent/validate", () => {
  it("returns valid=false when no consent exists", async () => {
    const req = makeRequest("http://localhost:3000/api/consent/validate", {
      method: "POST",
      body: JSON.stringify({
        data_principal_id: "user-999",
        purpose_id: "p-1",
      }),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(data.valid).toBe(false);
  });

  it("returns valid=true when active consent exists", async () => {
    const future = new Date();
    future.setDate(future.getDate() + 365);

    consentRows.push({
      id: "consent-1",
      org_id: "org_default_001",
      data_principal_id: "user-1",
      purpose_id: "p-1",
      consent_status: "active",
      purpose_description: "Analytics",
      expires_at: future.toISOString(),
    });

    const req = makeRequest("http://localhost:3000/api/consent/validate", {
      method: "POST",
      body: JSON.stringify({
        data_principal_id: "user-1",
        purpose_id: "p-1",
      }),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(data.valid).toBe(true);
    expect(data.consent_id).toBe("consent-1");
  });

  it("returns valid=false for expired consent", async () => {
    const past = new Date();
    past.setDate(past.getDate() - 10);

    consentRows.push({
      id: "consent-expired",
      org_id: "org_default_001",
      data_principal_id: "user-2",
      purpose_id: "p-2",
      consent_status: "active",
      expires_at: past.toISOString(),
    });

    const req = makeRequest("http://localhost:3000/api/consent/validate", {
      method: "POST",
      body: JSON.stringify({
        data_principal_id: "user-2",
        purpose_id: "p-2",
      }),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(data.valid).toBe(false);
  });

  it("returns 400 for missing data_principal_id", async () => {
    const req = makeRequest("http://localhost:3000/api/consent/validate", {
      method: "POST",
      body: JSON.stringify({ purpose_id: "p-1" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for missing purpose_id", async () => {
    const req = makeRequest("http://localhost:3000/api/consent/validate", {
      method: "POST",
      body: JSON.stringify({ data_principal_id: "user-1" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid JSON", async () => {
    const req = makeRequest("http://localhost:3000/api/consent/validate", {
      method: "POST",
      body: "{{bad",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
