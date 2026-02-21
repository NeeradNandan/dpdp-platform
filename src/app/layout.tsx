import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://yojak.ai";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Yojak — Compliance, Connected.",
    template: "%s | Yojak",
  },
  description:
    "Automated DPDP Act 2023 compliance for Indian businesses. Consent management, data mapping, AI grievance redressal, readiness scoring, and 22 Indian language support. Starting at Rs 999/month.",
  keywords: [
    "Yojak",
    "DPDP Act",
    "DPDP compliance",
    "Digital Personal Data Protection Act",
    "data privacy India",
    "consent management",
    "data mapping",
    "grievance redressal",
    "PII discovery",
    "privacy policy generator",
    "DPDP readiness score",
    "cookie scanner India",
    "MSME compliance",
    "Data Protection Board India",
    "consent manager India",
    "privacy as a service",
    "RegTech India",
  ],
  authors: [{ name: "Yojak" }],
  creator: "Yojak",
  publisher: "Yojak",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Yojak",
    title: "Yojak — Automated DPDP Act Compliance for Indian Businesses",
    description:
      "Protect your business from penalties up to Rs 250 crore. Automated consent management, PII data mapping, AI grievance redressal, and 22 Indian language support.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Yojak — Compliance, Connected.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yojak — Compliance, Connected.",
    description:
      "Consent management, data mapping, and grievance redressal for Indian businesses. Compliant with DPDP Act 2023.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-readable site description" />
        <link rel="alternate" type="text/plain" href="/llms-full.txt" title="LLM-readable full documentation" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
