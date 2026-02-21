import type {
  ClassificationResult,
  Complexity,
  Priority,
  RequestType,
} from "./types";

const KEYWORD_MAP: Record<string, string[]> = {
  erasure: [
    "delete", "erase", "remove", "forget", "wipe", "destroy",
    "eliminate", "purge", "deletion", "deleted",
  ],
  access: [
    "access", "view", "see", "know", "copy", "obtain", "provide",
    "share my data", "what data", "my information", "data you have",
  ],
  correction: [
    "correct", "update", "fix", "change", "amend", "modify",
    "wrong", "inaccurate", "incorrect", "error", "mistake",
  ],
  portability: [
    "transfer", "port", "move", "migrate", "export", "download",
    "portability", "take my data", "data export",
  ],
  objection: [
    "object", "stop", "cease", "opt out", "unsubscribe", "withdraw",
    "revoke", "consent", "withdraw consent", "no longer want",
  ],
};

const CRITICAL_KEYWORDS = ["urgent", "immediately", "breach", "children", "child"];
const HIGH_KEYWORDS = ["legal", "complaint", "dpb", "data protection board", "sue", "court"];
const LOW_KEYWORDS = ["general inquiry", "just asking", "curious", "information"];
const MANUAL_REVIEW_KEYWORDS = ["legal action", "dpb", "data protection board", "children", "child's data"];

function getWords(text: string): Set<string> {
  return new Set(text.match(/\b\w+\b/g) ?? []);
}

function getSubCategory(requestType: string, desc: string): string {
  if (requestType === "erasure") {
    if (desc.includes("account") || desc.includes("profile")) return "account_deletion";
    if (desc.includes("specific") || desc.includes("certain") || desc.includes("some")) return "partial_erasure";
    return "full_erasure";
  }
  if (requestType === "access") {
    if (desc.includes("export") || desc.includes("copy")) return "data_export_request";
    return "data_access_request";
  }
  if (requestType === "correction") {
    if (desc.includes("name") || desc.includes("address")) return "personal_details_correction";
    return "data_correction";
  }
  if (requestType === "portability") return "data_portability";
  if (requestType === "objection") {
    if (desc.includes("marketing") || desc.includes("email")) return "marketing_objection";
    return "processing_objection";
  }
  return "general";
}

function getPriority(desc: string): Priority {
  if (CRITICAL_KEYWORDS.some((kw) => desc.includes(kw))) return "critical";
  if (HIGH_KEYWORDS.some((kw) => desc.includes(kw))) return "high";
  if (LOW_KEYWORDS.some((kw) => desc.includes(kw))) return "low";
  return "medium";
}

function getComplexity(
  desc: string,
  scores: Record<string, number>,
  bestType: string,
): Complexity {
  const otherHighTypes = Object.entries(scores).filter(
    ([t, s]) => s > 0.3 && t !== bestType,
  );
  if (otherHighTypes.length >= 1) return "complex";
  if (["legal", "court", "lawyer", "dpb", "complaint"].some((kw) => desc.includes(kw))) return "complex";
  if ((scores[bestType] ?? 0) >= 0.7) return "simple";
  return "moderate";
}

function requiresManualReview(desc: string, confidence: number): boolean {
  if (confidence < 0.6) return true;
  return MANUAL_REVIEW_KEYWORDS.some((kw) => desc.includes(kw));
}

export function classify(description: string, statedType: RequestType): ClassificationResult {
  const desc = description.toLowerCase().trim();
  const words = getWords(desc);

  const scores: Record<string, number> = {};
  for (const [reqType, keywords] of Object.entries(KEYWORD_MAP)) {
    const matches = keywords.filter((kw) => desc.includes(kw) || words.has(kw)).length;
    scores[reqType] = Math.min(1.0, matches / Math.max(1, Math.floor(keywords.length / 2)));
  }

  if (statedType in scores) {
    scores[statedType] = Math.min(1.0, scores[statedType] + 0.2);
  }

  let bestType = statedType as string;
  let confidence = 0.4;

  if (Object.keys(scores).length > 0) {
    bestType = Object.entries(scores).reduce((a, b) => (b[1] > a[1] ? b : a))[0];
    confidence = scores[bestType];
  }

  return {
    request_type: bestType as RequestType,
    confidence: Math.round(confidence * 100) / 100,
    sub_category: getSubCategory(bestType, desc),
    priority: getPriority(desc),
    estimated_complexity: getComplexity(desc, scores, bestType),
    requires_manual_review: requiresManualReview(desc, confidence),
  };
}
