import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://yojak.ai";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/consent", "/data-mapping", "/grievances", "/settings", "/api/"],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/tools/"],
      },
      {
        userAgent: "Google-Extended",
        allow: ["/", "/tools/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/", "/tools/"],
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/", "/tools/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: ["/", "/tools/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/tools/"],
      },
      {
        userAgent: "Bytespider",
        allow: ["/", "/tools/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
