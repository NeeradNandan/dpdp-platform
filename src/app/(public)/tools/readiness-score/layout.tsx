import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Free DPDP Readiness Score Calculator",
  description:
    "Assess your organisation's compliance posture against the Digital Personal Data Protection Act 2023 in under 2 minutes. Get a detailed readiness score with actionable recommendations.",
  alternates: { canonical: "/tools/readiness-score" },
  openGraph: {
    title: "Free DPDP Readiness Score — How Compliant Is Your Business?",
    description:
      "Answer 10 quick questions and get an instant compliance readiness score for the DPDP Act 2023.",
  },
};

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://yojak.ai";

export default function ReadinessScoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            {
              "@type": "ListItem",
              position: 2,
              name: "Free Tools",
              item: `${SITE_URL}/tools`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: "DPDP Readiness Score",
              item: `${SITE_URL}/tools/readiness-score`,
            },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "DPDP Readiness Score Calculator",
          url: `${SITE_URL}/tools/readiness-score`,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
          description:
            "Free tool to assess your DPDP Act 2023 compliance readiness. Score your consent, data mapping, grievance, and privacy practices.",
        }}
      />
      {children}
    </>
  );
}
