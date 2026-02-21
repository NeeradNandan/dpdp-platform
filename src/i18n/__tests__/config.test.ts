import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  getLanguageByCode,
  isRTL,
} from "../config";

describe("SUPPORTED_LANGUAGES", () => {
  it("includes 23 languages (22 scheduled + English)", () => {
    expect(SUPPORTED_LANGUAGES).toHaveLength(23);
  });

  it("has English as the first entry", () => {
    expect(SUPPORTED_LANGUAGES[0].code).toBe("en");
  });

  it("every entry has required fields", () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(lang.code).toBeTruthy();
      expect(lang.name).toBeTruthy();
      expect(lang.nativeName).toBeTruthy();
      expect(lang.script).toBeTruthy();
    }
  });

  it("has no duplicate language codes", () => {
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});

describe("DEFAULT_LANGUAGE", () => {
  it("is English", () => {
    expect(DEFAULT_LANGUAGE).toBe("en");
  });
});

describe("getLanguageByCode", () => {
  it("finds a language by exact code", () => {
    expect(getLanguageByCode("hi")?.name).toBe("Hindi");
  });

  it("normalizes case", () => {
    expect(getLanguageByCode("HI")?.name).toBe("Hindi");
  });

  it("handles locale subtags (e.g. bn-IN)", () => {
    expect(getLanguageByCode("bn-IN")?.name).toBe("Bengali");
  });

  it("returns undefined for unknown codes", () => {
    expect(getLanguageByCode("xx")).toBeUndefined();
  });

  it("finds Tamil correctly", () => {
    expect(getLanguageByCode("ta")?.nativeName).toBe("தமிழ்");
  });
});

describe("isRTL", () => {
  it("returns true for Urdu", () => {
    expect(isRTL("ur")).toBe(true);
  });

  it("returns true for Sindhi", () => {
    expect(isRTL("sd")).toBe(true);
  });

  it("returns true for Kashmiri", () => {
    expect(isRTL("ks")).toBe(true);
  });

  it("returns false for Hindi", () => {
    expect(isRTL("hi")).toBe(false);
  });

  it("returns false for English", () => {
    expect(isRTL("en")).toBe(false);
  });

  it("normalizes case and subtags", () => {
    expect(isRTL("UR-PK")).toBe(true);
  });
});
