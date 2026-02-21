/**
 * i18n Configuration for DPDP PaaS Platform
 * Supports all 22 scheduled Indian languages + English as required by the DPDP Act 2023
 */

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  script: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: "en", name: "English", nativeName: "English", script: "Latn" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", script: "Deva" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", script: "Beng" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", script: "Telu" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", script: "Deva" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", script: "Taml" },
  { code: "ur", name: "Urdu", nativeName: "اردو", script: "Arab" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", script: "Gujr" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", script: "Knda" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", script: "Mlym" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", script: "Orya" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", script: "Guru" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া", script: "Beng" },
  { code: "mai", name: "Maithili", nativeName: "मैथिली", script: "Deva" },
  { code: "sa", name: "Sanskrit", nativeName: "संस्कृतम्", script: "Deva" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली", script: "Deva" },
  { code: "sd", name: "Sindhi", nativeName: "سنڌي", script: "Arab" },
  { code: "kok", name: "Konkani", nativeName: "कोंकणी", script: "Deva" },
  { code: "doi", name: "Dogri", nativeName: "डोगरी", script: "Deva" },
  { code: "mni", name: "Manipuri", nativeName: "মৈতৈলোন্", script: "Beng" },
  { code: "sat", name: "Santali", nativeName: "ᱥᱟᱱᱛᱟᱲᱤ", script: "Olck" },
  { code: "ks", name: "Kashmiri", nativeName: "कॉशुर", script: "Arab" },
  { code: "bo", name: "Bodo", nativeName: "बड़ो", script: "Deva" },
];

export const DEFAULT_LANGUAGE = "en" as const;

export type LanguageCode =
  | "en"
  | "hi"
  | "bn"
  | "te"
  | "mr"
  | "ta"
  | "ur"
  | "gu"
  | "kn"
  | "ml"
  | "or"
  | "pa"
  | "as"
  | "mai"
  | "sa"
  | "ne"
  | "sd"
  | "kok"
  | "doi"
  | "mni"
  | "sat"
  | "ks"
  | "bo";

/** Right-to-left script languages */
const RTL_LANGUAGE_CODES: Set<string> = new Set(["ur", "sd", "ks"]);

export function getLanguageByCode(code: string): SupportedLanguage | undefined {
  const normalized = code.toLowerCase().split("-")[0];
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === normalized);
}

export function isRTL(code: string): boolean {
  const normalized = code.toLowerCase().split("-")[0];
  return RTL_LANGUAGE_CODES.has(normalized);
}
