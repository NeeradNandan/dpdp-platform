/**
 * @jest-environment node
 *
 * Integration tests for /api/tools
 * Tests PLG tools: readiness-score, cookie-scanner, policy-generator.
 */
import { NextRequest } from "next/server";
import { POST } from "../route";

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest(new URL("http://localhost:3000/api/tools"), {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/tools - readiness-score", () => {
  it("returns a readiness score with all categories", async () => {
    const answers: Record<string, string> = {};
    const categories = [
      "consent_management",
      "data_mapping",
      "grievance_redressal",
      "breach_notification",
      "security_safeguards",
      "children_data",
    ];
    const counts = [4, 3, 3, 2, 3, 2];

    categories.forEach((cat, ci) => {
      for (let i = 0; i < counts[ci]; i++) {
        answers[`${cat}_${i}`] = "Yes";
      }
    });

    const req = makeRequest({ tool: "readiness-score", answers });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.overall).toBe(100);
    expect(data.categories.consent_management).toBe(100);
    expect(data.recommendations).toBeDefined();
    expect(data.generated_at).toBeDefined();
  });

  it("scores 0 when all answers are No", async () => {
    const answers: Record<string, string> = {};
    const categories = [
      "consent_management",
      "data_mapping",
      "grievance_redressal",
      "breach_notification",
      "security_safeguards",
      "children_data",
    ];
    const counts = [4, 3, 3, 2, 3, 2];

    categories.forEach((cat, ci) => {
      for (let i = 0; i < counts[ci]; i++) {
        answers[`${cat}_${i}`] = "No";
      }
    });

    const req = makeRequest({ tool: "readiness-score", answers });
    const res = await POST(req);
    const data = await res.json();

    expect(data.overall).toBe(0);
  });

  it("generates recommendations for low-scoring categories", async () => {
    const answers: Record<string, string> = {};
    const categories = ["consent_management", "data_mapping", "grievance_redressal", "breach_notification", "security_safeguards", "children_data"];
    const counts = [4, 3, 3, 2, 3, 2];

    categories.forEach((cat, ci) => {
      for (let i = 0; i < counts[ci]; i++) {
        answers[`${cat}_${i}`] = "No";
      }
    });

    const req = makeRequest({ tool: "readiness-score", answers });
    const res = await POST(req);
    const data = await res.json();

    expect(data.recommendations.length).toBeGreaterThan(0);
    expect(data.recommendations.length).toBeLessThanOrEqual(5);
  });
});

describe("POST /api/tools - cookie-scanner", () => {
  it("returns mock cookies for a scanned URL", async () => {
    const req = makeRequest({ tool: "cookie-scanner", url: "https://example.com" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.cookies).toBeDefined();
    expect(Array.isArray(data.cookies)).toBe(true);
    expect(data.cookies.length).toBeGreaterThan(0);
    expect(data.url).toBe("https://example.com");
  });

  it("each cookie has required fields", async () => {
    const req = makeRequest({ tool: "cookie-scanner", url: "https://test.in" });
    const res = await POST(req);
    const data = await res.json();

    for (const cookie of data.cookies) {
      expect(cookie.name).toBeDefined();
      expect(cookie.category).toBeDefined();
      expect(cookie.provider).toBeDefined();
      expect(typeof cookie.compliant).toBe("boolean");
    }
  });
});

describe("POST /api/tools - policy-generator", () => {
  it("generates an HTML privacy policy", async () => {
    const req = makeRequest({
      tool: "policy-generator",
      config: {
        orgName: "Test Corp",
        websiteUrl: "https://test.com",
        industry: "Technology",
        dataTypes: ["Name", "Email"],
        purposes: { Marketing: "1 year" },
        dpoName: "John Doe",
        dpoEmail: "dpo@test.com",
        grievanceOfficerName: "Jane Doe",
        childrenData: false,
        crossBorderTransfer: false,
        thirdPartyProcessors: "AWS, Google Cloud",
      },
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.policy).toContain("Privacy Policy");
    expect(data.policy).toContain("Test Corp");
    expect(data.policy).toContain("DPDP Act");
    expect(data.policy).toContain("AWS");
  });

  it("returns 400 when config is missing", async () => {
    const req = makeRequest({ tool: "policy-generator" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/tools - unknown tool", () => {
  it("returns 400 for unknown tool name", async () => {
    const req = makeRequest({ tool: "nonexistent" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("Unknown tool");
  });
});
