/**
 * @jest-environment node
 *
 * Integration tests for /api/grievances
 * Tests grievance creation with auto-classification and SLA deadlines.
 * Mocks both the Supabase server client and auth flow.
 */
import { NextRequest } from "next/server";
import { GET, POST } from "../route";

interface Row {
  id: string;
  [key: string]: unknown;
}

let rows: Row[] = [];
const MOCK_USER_ID = "user-test-1234";
const MOCK_ORG_ID = "org-test-5678";

function resetStore() {
  rows = [];
}

function mockChain(table: string) {
  const ctx: {
    table: string;
    filters: Array<{ col: string; val: unknown }>;
    insertData: Row | null;
    ascending: boolean;
  } = {
    table,
    filters: [],
    insertData: null,
    ascending: false,
  };

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
        const newRow = {
          id: `id-${Date.now()}-${Math.random()}`,
          created_at: now,
          updated_at: now,
          ...ctx.insertData,
        };
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

  // Default terminal — called when Jest resolves the chain as a promise
  const thenHandler = () => {
    if (ctx.insertData) {
      const now = new Date().toISOString();
      const newRow = {
        id: `id-${Date.now()}-${Math.random()}`,
        created_at: now,
        updated_at: now,
        ...ctx.insertData,
      };
      rows.push(newRow);
      return { data: [newRow], error: null };
    }
    return { data: filtered(), error: null };
  };

  chain.then = (resolve: (v: unknown) => void) => resolve(thenHandler());

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

describe("GET /api/grievances", () => {
  it("returns empty items array when no grievances exist", async () => {
    const req = makeRequest("http://localhost:3000/api/grievances");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items).toHaveLength(0);
  });

  it("returns created grievances", async () => {
    const postReq = makeRequest("http://localhost:3000/api/grievances", {
      method: "POST",
      body: JSON.stringify({
        data_principal_email: "a@b.com",
        request_type: "access",
        description: "I want to view my data",
      }),
    });
    await POST(postReq);

    const req = makeRequest("http://localhost:3000/api/grievances");
    const res = await GET(req);
    const data = await res.json();

    expect(data.items.length).toBeGreaterThan(0);
  });
});

describe("POST /api/grievances", () => {
  const validBody = {
    data_principal_email: "test@example.com",
    request_type: "erasure",
    description: "Please delete all my personal data from your systems.",
  };

  it("creates a grievance and returns 201", async () => {
    const req = makeRequest("http://localhost:3000/api/grievances", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.case_id).toMatch(/^GRV-\d{4}-/);
    expect(data.status).toBe("open");
    expect(data.sla_deadline).toBeDefined();
  });

  it("auto-classifies erasure requests", async () => {
    const req = makeRequest("http://localhost:3000/api/grievances", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(data.ai_classification).toBe("erasure_request");
  });

  it("auto-classifies access requests", async () => {
    const req = makeRequest("http://localhost:3000/api/grievances", {
      method: "POST",
      body: JSON.stringify({
        ...validBody,
        request_type: "access",
        description: "I want to view my personal data",
      }),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(data.ai_classification).toBe("access_request");
  });

  it("sets SLA deadline 90 days in the future", async () => {
    const req = makeRequest("http://localhost:3000/api/grievances", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    const data = await res.json();

    const created = new Date(data.created_at);
    const deadline = new Date(data.sla_deadline);
    const diffDays = Math.round(
      (deadline.getTime() - created.getTime()) / (1000 * 60 * 60 * 24),
    );
    expect(diffDays).toBe(90);
  });

  it("returns 400 for missing email", async () => {
    const req = makeRequest("http://localhost:3000/api/grievances", {
      method: "POST",
      body: JSON.stringify({ ...validBody, data_principal_email: "" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid request_type", async () => {
    const req = makeRequest("http://localhost:3000/api/grievances", {
      method: "POST",
      body: JSON.stringify({ ...validBody, request_type: "invalid" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("defaults priority to medium", async () => {
    const req = makeRequest("http://localhost:3000/api/grievances", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(data.priority).toBe("medium");
  });

  it("returns 400 for invalid JSON", async () => {
    const req = makeRequest("http://localhost:3000/api/grievances", {
      method: "POST",
      body: "bad-json",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
