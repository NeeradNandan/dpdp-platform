import { CORS_HEADERS } from "../cors";

describe("CORS_HEADERS", () => {
  it("allows all origins for widget embedding", () => {
    expect(CORS_HEADERS["Access-Control-Allow-Origin"]).toBe("*");
  });

  it("includes required HTTP methods", () => {
    const methods = CORS_HEADERS["Access-Control-Allow-Methods"];
    expect(methods).toContain("GET");
    expect(methods).toContain("POST");
    expect(methods).toContain("PATCH");
    expect(methods).toContain("DELETE");
    expect(methods).toContain("OPTIONS");
  });

  it("allows X-Org-Id header for multi-tenant routing", () => {
    expect(CORS_HEADERS["Access-Control-Allow-Headers"]).toContain("X-Org-Id");
  });

  it("allows Content-Type and Authorization headers", () => {
    const headers = CORS_HEADERS["Access-Control-Allow-Headers"];
    expect(headers).toContain("Content-Type");
    expect(headers).toContain("Authorization");
  });
});
