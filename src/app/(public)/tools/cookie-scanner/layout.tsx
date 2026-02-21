import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Free Website Cookie Scanner",
  description:
    "Scan any website to discover cookies, trackers, and third-party scripts. Identify DPDP Act consent requirements for your web properties in seconds.",
  alternates: { canonical: "/tools/cookie-scanner" },
  openGraph: {
    title: "Free Cookie Scanner — Find Every Tracker on Your Website",
    description:
      "Discover cookies, analytics trackers, and third-party scripts that require consent under the DPDP Act 2023.",
  },
};

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://yojak.ai";

export default function CookieScannerLayout({
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
              name: "Cookie Scanner",
              item: `${SITE_URL}/tools/cookie-scanner`,
            },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Website Cookie Scanner",
          url: `${SITE_URL}/tools/cookie-scanner`,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
          description:
            "Free tool to scan websites for cookies, trackers, and third-party scripts requiring DPDP Act consent.",
        }}
      />
      {children}
    </>
  );
}
