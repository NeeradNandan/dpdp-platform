/**
 * @jest-environment node
 *
 * Integration tests for /api/data-mapping
 * Tests PII data map listing, filtering, and creation.
 */
import { NextRequest } from "next/server";
import { GET, POST } from "../route";

function makeRequest(url: string, init?: { method?: string; body?: string }): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"), init);
}

describe("GET /api/data-mapping", () => {
  it("returns mock data map entries", async () => {
    const req = makeRequest("http://localhost:3000/api/data-mapping");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items.length).toBeGreaterThan(0);
  });

  it("filters by source_system", async () => {
    const req = makeRequest("http://localhost:3000/api/data-mapping?source_system=MongoDB");
    const res = await GET(req);
    const data = await res.json();

    for (const item of data.items) {
      expect(item.source_system).toBe("MongoDB");
    }
  });

  it("filters by pii_type", async () => {
    const req = makeRequest("http://localhost:3000/api/data-mapping?pii_type=email");
    const res = await GET(req);
    const data = await res.json();

    expect(data.items.length).toBeGreaterThan(0);
    for (const item of data.items) {
      expect(item.pii_type).toBe("email");
    }
  });

  it("filters by sensitivity", async () => {
    const req = makeRequest("http://localhost:3000/api/data-mapping?sensitivity=critical");
    const res = await GET(req);
    const data = await res.json();

    for (const item of data.items) {
      expect(item.sensitivity).toBe("critical");
    }
  });

  it("returns empty array for non-matching filter", async () => {
    const req = makeRequest("http://localhost:3000/api/data-mapping?source_system=Oracle");
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
