/**
 * @jest-environment node
 *
 * Integration tests for /api/consent/validate
 * Tests real-time consent validation per MeitY BRD.
 */
import { NextRequest } from "next/server";
import { POST } from "../validate/route";
import { POST as createConsent } from "../route";
import { consentStore } from "@/lib/consent-store";

function makeRequest(url: string, init?: RequestInit): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"), init);
}

beforeEach(() => {
  consentStore.clear();
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
    const createReq = makeRequest("http://localhost:3000/api/consent", {
      method: "POST",
      body: JSON.stringify({
        data_principal_id: "user-1",
        purpose_id: "p-1",
        consent_method: "explicit_click",
        session_id: "sess-1",
      }),
    });
    await createConsent(createReq);

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
    expect(data.consent_id).toBeDefined();
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
