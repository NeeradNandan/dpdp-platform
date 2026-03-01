import Link from "next/link";
import { Shield } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { FaqAccordion } from "@/components/ui/faq-accordion";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://yojak.ai";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Yojak",
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
  description:
    "Compliance, Connected. Automated DPDP Act 2023 compliance platform for Indian businesses.",
  foundingDate: "2025",
  areaServed: { "@type": "Country", name: "India" },
  sameAs: [],
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Yojak",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  description:
    "Automated DPDP Act compliance platform with consent management, PII data mapping, grievance redressal, and 22 Indian language support.",
  offers: [
    {
      "@type": "Offer",
      name: "Hook",
      price: "999",
      priceCurrency: "INR",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "999",
        priceCurrency: "INR",
        unitText: "MONTH",
      },
    },
    {
      "@type": "Offer",
      name: "Core",
      price: "15000",
      priceCurrency: "INR",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "15000",
        priceCurrency: "INR",
        unitText: "MONTH",
      },
    },
    {
      "@type": "Offer",
      name: "Scale",
      price: "50000",
      priceCurrency: "INR",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "50000",
        priceCurrency: "INR",
        unitText: "MONTH",
      },
    },
  ],
  featureList: [
    "Consent Management",
    "PII Data Mapping",
    "AI Grievance Redressal",
    "Privacy Policy Generator",
    "Cookie Scanner",
    "DPDP Readiness Score",
    "22 Indian Languages",
    "90-Day SLA Tracking",
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the DPDP Act 2023?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Digital Personal Data Protection Act 2023 (DPDP Act) is India's comprehensive data privacy law that regulates how businesses collect, store, process, and share personal data of Indian citizens. Non-compliance can attract penalties of up to Rs 250 crore.",
      },
    },
    {
      "@type": "Question",
      name: "Who needs to comply with the DPDP Act?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Every entity — from startups and MSMEs to large enterprises — that processes the digital personal data of individuals in India must comply with the DPDP Act. This includes businesses offering goods or services to Indian residents, even if they are based outside India.",
      },
    },
    {
      "@type": "Question",
      name: "What is Yojak?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yojak is a Privacy-as-a-Service platform that automates DPDP Act compliance for Indian businesses. The name means 'connector' in Sanskrit — connecting businesses to data privacy compliance. It provides consent management, PII data mapping, AI-powered grievance redressal, privacy policy generation, cookie scanning, and supports 22 Indian languages.",
      },
    },
    {
      "@type": "Question",
      name: "How much does Yojak cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yojak offers three plans: Hook at Rs 999/month for consent banners and policy generation, Core at Rs 15,000/month for data mapping and PII discovery, and Scale at Rs 50,000/month with AI grievance bot and full automation.",
      },
    },
    {
      "@type": "Question",
      name: "What are the penalties for non-compliance with the DPDP Act?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Penalties under the DPDP Act range from Rs 10,000 for individual non-compliance to Rs 250 crore for significant breaches by data fiduciaries. The Data Protection Board of India can impose these fines after investigation.",
      },
    },
  ],
};

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <JsonLd data={organizationSchema} />
      <JsonLd data={softwareSchema} />
      <JsonLd data={faqSchema} />

      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-semibold text-slate-900"
          >
            <Shield className="h-7 w-7 text-indigo-600" />
            Yojak
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 to-white px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Automate Your DPDP Compliance
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Non-compliance risks penalties up to Rs 250 crore. Yojak
            connects your business with automated consent management, data
            mapping, and grievance redressal — so you stay compliant and focus on
            growth.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 sm:w-auto"
            >
              Start Free Trial
            </Link>
            <Link
              href="/tools/readiness-score"
              className="inline-flex w-full items-center justify-center rounded-lg border-2 border-slate-300 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
            >
              Check Your Readiness Score
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">6.3 Cr+</p>
              <p className="mt-1 text-sm text-slate-600">MSMEs at Risk</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">$1.5B</p>
              <p className="mt-1 text-sm text-slate-600">Market by 2026</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">22</p>
              <p className="mt-1 text-sm text-slate-600">Languages Supported</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">90-Day</p>
              <p className="mt-1 text-sm text-slate-600">SLA Tracking</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold text-slate-900">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
            Choose the plan that fits your compliance needs. Scale as you grow.
          </p>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {/* Hook */}
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="h-7" aria-hidden="true" />
              <h3 className="mt-4 text-xl font-semibold text-slate-900">Hook</h3>
              <p className="mt-4">
                <span className="text-3xl font-bold text-slate-900">₹999</span>
                <span className="text-slate-600">/mo</span>
              </p>
              <ul className="mt-6 flex-1 space-y-4">
                <li className="flex items-center gap-2 text-slate-600">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" />
                  Consent Banner
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" />
                  Policy Generator
                </li>
              </ul>
              <Link
                href="/signup"
                className="mt-8 block w-full rounded-lg border-2 border-slate-300 py-3 text-center font-semibold text-slate-700 hover:bg-slate-50"
              >
                Get Started
              </Link>
            </div>

            {/* Core */}
            <div className="flex flex-col rounded-2xl border-2 border-indigo-600 bg-white p-8 shadow-lg ring-2 ring-indigo-100">
              <div className="h-7">
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                  Most Popular
                </span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-slate-900">Core</h3>
              <p className="mt-4">
                <span className="text-3xl font-bold text-slate-900">₹15,000</span>
                <span className="text-slate-600">/mo</span>
              </p>
              <ul className="mt-6 flex-1 space-y-4">
                <li className="flex items-center gap-2 text-slate-600">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" />
                  Data Mapping Dashboard
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" />
                  PII Discovery
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" />
                  Consent Banner + Policy
                </li>
              </ul>
              <Link
                href="/signup"
                className="mt-8 block w-full rounded-lg bg-indigo-600 py-3 text-center font-semibold text-white hover:bg-indigo-700"
              >
                Get Started
              </Link>
            </div>

            {/* Scale */}
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="h-7" aria-hidden="true" />
              <h3 className="mt-4 text-xl font-semibold text-slate-900">Scale</h3>
              <p className="mt-4">
                <span className="text-3xl font-bold text-slate-900">₹50,000</span>
                <span className="text-slate-600">/mo</span>
              </p>
              <ul className="mt-6 flex-1 space-y-4">
                <li className="flex items-center gap-2 text-slate-600">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" />
                  AI Grievance Bot
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" />
                  Full Automation
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" />
                  Dedicated Support
                </li>
              </ul>
              <Link
                href="/signup"
                className="mt-8 block w-full rounded-lg border-2 border-slate-300 py-3 text-center font-semibold text-slate-700 hover:bg-slate-50"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-200 bg-slate-50 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-slate-600">
            Everything you need to know about DPDP Act compliance and how Yojak
            helps your business.
          </p>
          <FaqAccordion
            items={(
              faqSchema.mainEntity as Array<{
                name: string;
                acceptedAnswer: { text: string };
              }>
            ).map((faq) => ({
              question: faq.name,
              answer: faq.acceptedAnswer.text,
            }))}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-900 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-indigo-400" />
              <span className="text-lg font-semibold text-white">
                Yojak
              </span>
            </div>
            <p className="text-center text-sm text-slate-400 md:text-left">
              Privacy-as-a-Service Compliance Platform. Automated DPDP Act
              compliance for Indian businesses.
            </p>
            <div className="flex gap-6">
              <Link
                href="/login"
                className="text-sm text-slate-400 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-sm text-slate-400 hover:text-white"
              >
                Get Started
              </Link>
            </div>
          </div>
          <p className="mt-8 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Yojak. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
