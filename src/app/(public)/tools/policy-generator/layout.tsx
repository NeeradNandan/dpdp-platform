import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Free DPDP Privacy Policy Generator",
  description:
    "Generate a DPDP Act 2023 compliant privacy policy for your Indian business in minutes. Customisable templates covering consent, data processing, and data principal rights.",
  alternates: { canonical: "/tools/policy-generator" },
  openGraph: {
    title: "Free Privacy Policy Generator — DPDP Act 2023 Compliant",
    description:
      "Create a legally-aligned privacy policy for your business. Covers consent, data principal rights, and cross-border transfer obligations.",
  },
};

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://yojak.ai";

export default function PolicyGeneratorLayout({
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
              name: "Privacy Policy Generator",
              item: `${SITE_URL}/tools/policy-generator`,
            },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Privacy Policy Generator",
          url: `${SITE_URL}/tools/policy-generator`,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
          description:
            "Generate a DPDP Act 2023 compliant privacy policy customised for your Indian business.",
        }}
      />
      {children}
    </>
  );
}
