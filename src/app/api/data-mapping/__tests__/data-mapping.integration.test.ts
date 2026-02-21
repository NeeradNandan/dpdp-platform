/**
 * @jest-environment node
 *
 * Integration tests for /api/data-mapping
 * Tests PII data map listing, filtering, and creation.
 * Mocks the Supabase server client and auth flow.
 */
import { NextRequest } from "next/server";
import { GET, POST } from "../route";

interface Row {
  id: string;
  [key: string]: unknown;
}

let rows: Row[] = [];
const MOCK_USER_ID = "user-dm-1234";
const MOCK_ORG_ID = "org-dm-5678";

function resetStore() {
  rows = [];
}

function mockChain(table: string) {
  const ctx: {
    table: string;
    filters: Array<{ col: string; val: unknown }>;
    insertData: Row | null;
  } = { table, filters: [], insertData: null };

  const chain: Record<string, (...args: unknown[]) => unknown> = {
    select() { return chain; },
    eq(col: string, val: unknown) {
      ctx.filters.push({ col, val });
      return chain;
    },
    limit() { return chain; },
    order() { return chain; },
    insert(data: Row) {
      ctx.insertData = data;
      return chain;
    },
    single() {
      if (ctx.insertData) {
        const now = new Date().toISOString();
        const newRow = { id: `id-${Date.now()}-${Math.random()}`, created_at: now, ...ctx.insertData };
        rows.push(newRow);
        return { data: newRow, error: null };
      }
      if (ctx.table === "org_members") {
        return { data: { org_id: MOCK_ORG_ID }, error: null };
      }
      const all = filtered();
      return { data: all[0] ?? null, error: null };
    },
  };

  function filtered(): Row[] {
    let result = rows;
    for (const f of ctx.filters) {
      result = result.filter((r) => r[f.col] === f.val);
    }
    return result;
  }

  chain.then = (resolve: (v: unknown) => void) => {
    if (ctx.insertData) {
      const now = new Date().toISOString();
      const newRow = { id: `id-${Date.now()}-${Math.random()}`, created_at: now, ...ctx.insertData };
      rows.push(newRow);
      return resolve({ data: [newRow], error: null });
    }
    return resolve({ data: filtered(), error: null });
  };

  return chain;
}

jest.mock("@/lib/supabase/server", () => ({
  createClient: () =>
    Promise.resolve({
      auth: {
        getUser: () =>
          Promise.resolve({ data: { user: { id: MOCK_USER_ID } } }),
      },
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

describe("GET /api/data-mapping", () => {
  it("returns empty items array when no entries exist", async () => {
    const req = makeRequest("http://localhost:3000/api/data-mapping");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items).toHaveLength(0);
  });

  it("returns created entries", async () => {
    const postReq = makeRequest("http://localhost:3000/api/data-mapping", {
      method: "POST",
      body: JSON.stringify({
        source_system: "MySQL",
        table_or_collection: "users",
        field_name: "email",
        pii_type: "email",
        sensitivity: "high",
      }),
    });
    await POST(postReq);

    const req = makeRequest("http://localhost:3000/api/data-mapping");
    const res = await GET(req);
    const data = await res.json();

    expect(data.items.length).toBeGreaterThan(0);
  });

  it("returns empty array for non-matching filter", async () => {
    const req = makeRequest(
      "http://localhost:3000/api/data-mapping?source_system=Oracle",
    );
    const res = await GET(req);
    const data = await res.json();

    expect(data.items).toHaveLength(0);
  });
});

describe("POST /api/data-mapping", () => {
  const validBody = {
    source_system: "MySQL",
    table_or_collection: "customers",
    field_name: "passport_number",
    pii_type: "other",
    sensitivity: "critical",
  };

  it("creates a data map entry and returns 201", async () => {
    const req = makeRequest("http://localhost:3000/api/data-mapping", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.id).toBeDefined();
    expect(data.source_system).toBe("MySQL");
    expect(data.pii_type).toBe("other");
  });

  it("returns 400 for missing source_system", async () => {
    const req = makeRequest("http://localhost:3000/api/data-mapping", {
      method: "POST",
      body: JSON.stringify({ ...validBody, source_system: "" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid pii_type", async () => {
    const req = makeRequest("http://localhost:3000/api/data-mapping", {
      method: "POST",
      body: JSON.stringify({ ...validBody, pii_type: "invalid" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid sensitivity", async () => {
    const req = makeRequest("http://localhost:3000/api/data-mapping", {
      method: "POST",
      body: JSON.stringify({ ...validBody, sensitivity: "extreme" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for missing field_name", async () => {
    const req = makeRequest("http://localhost:3000/api/data-mapping", {
      method: "POST",
      body: JSON.stringify({ ...validBody, field_name: "" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid JSON", async () => {
    const req = makeRequest("http://localhost:3000/api/data-mapping", {
      method: "POST",
      body: "not-json",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("defaults encryption_status to unencrypted", async () => {
    const req = makeRequest("http://localhost:3000/api/data-mapping", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(data.encryption_status).toBe("unencrypted");
  });

  it("returns 400 for missing table_or_collection", async () => {
    const req = makeRequest("http://localhost:3000/api/data-mapping", {
      method: "POST",
      body: JSON.stringify({ ...validBody, table_or_collection: "" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
