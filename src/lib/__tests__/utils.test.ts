import { cn, formatDate, generateCaseId, calculateSLADeadline } from "../utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("");
  });
});

describe("formatDate", () => {
  it("formats ISO date to en-IN locale string", () => {
    const result = formatDate("2026-02-15T10:30:00Z");
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2026/);
  });

  it("handles date-only strings", () => {
    const result = formatDate("2026-01-01");
    expect(result).toMatch(/2026/);
  });
});

describe("generateCaseId", () => {
  it("returns a string matching GRV-YYYY-XXXXX pattern", () => {
    const id = generateCaseId();
    expect(id).toMatch(/^GRV-\d{4}-[A-Z0-9]{5}$/);
  });

  it("includes current year", () => {
    const year = new Date().getFullYear().toString();
    expect(generateCaseId()).toContain(year);
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateCaseId()));
    expect(ids.size).toBeGreaterThan(45);
  });
});

describe("calculateSLADeadline", () => {
  it("adds 90 days by default", () => {
    const created = "2026-01-01T00:00:00Z";
    const deadline = calculateSLADeadline(created);
    const result = new Date(deadline);
    const expected = new Date("2026-04-01T00:00:00Z");
    expect(result.getTime()).toBe(expected.getTime());
  });

  it("accepts custom day count", () => {
    const created = "2026-01-01T00:00:00Z";
    const deadline = calculateSLADeadline(created, 30);
    const result = new Date(deadline);
    const expected = new Date("2026-01-31T00:00:00Z");
    expect(result.getTime()).toBe(expected.getTime());
  });

  it("returns a valid ISO string", () => {
    const deadline = calculateSLADeadline("2026-06-15T12:00:00Z", 7);
    expect(new Date(deadline).toISOString()).toBe(deadline);
  });
});
