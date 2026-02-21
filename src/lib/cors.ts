/**
 * CORS headers for external consent widget integration.
 * Per MeitY BRD - consent APIs may be called from embedded widgets.
 */

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Org-Id",
} as const;
