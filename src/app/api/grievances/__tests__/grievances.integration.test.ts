/**
 * @jest-environment node
 *
 * Integration tests for /api/grievances
 * Tests grievance creation with auto-classification and SLA deadlines.
 */
import { NextRequest } from "next/server";
import { GET, POST } from "../route";

function makeRequest(url: string, init?: RequestInit): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"), init);
}

describe("GET /api/grievances", () => {
  it("returns mock grievances with items array", async () => {
    const req = makeRequest("http://localhost:3000/api/grievances");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items.length).toBeGreaterThan(0);
  });

  it("filters by status", async () => {
    const req = makeRequest("http://localhost:3000/api/grievances?status=open");
    const res = await GET(req);
    const data = await res.json();

    for (const item of data.items) {
      expect(item.status).toBe("open");
    }
  });

  it("filters by priority", async () => {
    const req = makeRequest("http://localhost:3000/api/grievances?priority=critical");
    const res = await GET(req);
    const data = await res.json();

    for (const item of data.items) {
      expect(item.priority).toBe("critical");
    }
  });

  it("filters by request_type", async () => {
    const req = makeRequest("http://localhost:3000/api/grievances?request_type=erasure");
    const res = await GET(req);
    const data = await res.json();

    for (const item of data.items) {
      expect(item.request_type).toBe("erasure");
    }
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
    const diffDays = Math.round((deadline.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
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
