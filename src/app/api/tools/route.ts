import { NextRequest, NextResponse } from "next/server";
import type { ReadinessScore } from "@/types";

const QUESTIONS_CONFIG: Record<
  string,
  { scores: Record<string, number>; max: number }[]
> = {
  consent_management: [
    { scores: { Yes: 10, Partially: 5, No: 0 }, max: 10 },
    { scores: { Yes: 10, Partially: 5, No: 0 }, max: 10 },
    { scores: { Yes: 10, Partially: 5, No: 0 }, max: 10 },
    { scores: { Yes: 10, Partially: 5, No: 0 }, max: 10 },
  ],
  data_mapping: [
    { scores: { Yes: 15, Partially: 8, No: 0 }, max: 15 },
    { scores: { Yes: 10, Partially: 5, No: 0 }, max: 10 },
    { scores: { Yes: 15, Partially: 8, No: 0 }, max: 15 },
  ],
  grievance_redressal: [
    { scores: { Yes: 10, Partially: 5, No: 0 }, max: 10 },
    { scores: { Yes: 10, Partially: 5, No: 0 }, max: 10 },
    { scores: { Yes: 10, Partially: 5, No: 0 }, max: 10 },
  ],
  breach_notification: [
    { scores: { Yes: 15, Partially: 8, No: 0 }, max: 15 },
    { scores: { Yes: 15, Partially: 8, No: 0 }, max: 15 },
  ],
  security_safeguards: [
    { scores: { Yes: 10, Partially: 5, No: 0 }, max: 10 },
    { scores: { Yes: 10, Partially: 5, No: 0 }, max: 10 },
    { scores: { Yes: 10, Partially: 5, No: 0 }, max: 10 },
  ],
  children_data: [
    { scores: { Yes: 10, Partially: 5, No: 0, "N/A": 10 }, max: 10 },
    { scores: { Yes: 10, Partially: 5, No: 0, "N/A": 10 }, max: 10 },
  ],
};

const MOCK_COOKIES = [
  {
    name: "_ga",
    category: "Analytics",
    provider: "Google",
    purpose: "Analytics",
    duration: "2 years",
    compliant: false,
  },
  {
    name: "_gid",
    category: "Analytics",
    provider: "Google",
    purpose: "Analytics",
    duration: "24 hours",
    compliant: false,
  },
  {
    name: "_fbp",
    category: "Marketing",
    provider: "Facebook",
    purpose: "Advertising",
    duration: "90 days",
    compliant: false,
  },
  {
    name: "JSESSIONID",
    category: "Essential",
    provider: "Internal",
    purpose: "Session",
    duration: "Session",
    compliant: true,
  },
  {
    name: "stripe_mid",
    category: "Essential",
    provider: "Stripe",
    purpose: "Payment",
    duration: "1 year",
    compliant: true,
  },
  {
    name: "_gcl_au",
    category: "Marketing",
    provider: "Google Ads",
    purpose: "Advertising",
    duration: "90 days",
    compliant: false,
  },
  {
    name: "intercom-id",
    category: "Marketing",
    provider: "Intercom",
    purpose: "Chat",
    duration: "1 year",
    compliant: false,
  },
  {
    name: "csrf_token",
    category: "Essential",
    provider: "Internal",
    purpose: "Security",
    duration: "Session",
    compliant: true,
  },
  {
    name: "session_id",
    category: "Essential",
    provider: "Internal",
    purpose: "Session",
    duration: "Session",
    compliant: true,
  },
  {
    name: "_uetsid",
    category: "Marketing",
    provider: "Bing",
    purpose: "Advertising",
    duration: "30 days",
    compliant: false,
  },
  {
    name: "mp_xxxxx",
    category: "Analytics",
    provider: "Mixpanel",
    purpose: "Analytics",
    duration: "1 year",
    compliant: false,
  },
  {
    name: "unknown_tracker",
    category: "Unknown",
    provider: "Unknown",
    purpose: "Unknown",
    duration: "Unknown",
    compliant: false,
  },
];

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function generatePolicy(config: {
  orgName: string;
  websiteUrl: string;
  industry: string;
  gstin?: string;
  dataTypes: string[];
  purposes: Record<string, string>;
  dpoName: string;
  dpoEmail: string;
  grievanceOfficerName: string;
  childrenData: boolean;
  crossBorderTransfer: boolean;
  thirdPartyProcessors: string;
}): string {
  const purposesList = Object.entries(config.purposes)
    .map(
      ([p, r]) =>
        `<li><strong>${escapeHtml(p)}</strong> – Retention: ${escapeHtml(r)}</li>`
    )
    .join("");
  const dataList = config.dataTypes
    .map((d) => `<li>${escapeHtml(d)}</li>`)
    .join("");
  const processors = config.thirdPartyProcessors
    ? config.thirdPartyProcessors
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => `<li>${escapeHtml(p)}</li>`)
        .join("")
    : "<li>None disclosed</li>";

  return `
<h1>Privacy Policy</h1>
<p><em>Last updated: ${new Date().toLocaleDateString("en-IN")}</em></p>
<p>This Privacy Policy is issued in compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act) and its rules.</p>

<h2>1. Data Fiduciary Details (Section 8)</h2>
<p><strong>Organization:</strong> ${escapeHtml(config.orgName)}</p>
<p><strong>Website:</strong> ${escapeHtml(config.websiteUrl)}</p>
<p><strong>Industry:</strong> ${escapeHtml(config.industry)}</p>
${config.gstin ? `<p><strong>GSTIN:</strong> ${escapeHtml(config.gstin)}</p>` : ""}

<h2>2. Personal Data We Collect</h2>
<p>We collect the following categories of personal data:</p>
<ul>${dataList}</ul>

<h2>3. Purposes of Processing (Section 6)</h2>
<p>We process your personal data for the following purposes:</p>
<ul>${purposesList}</ul>

<h2>4. Data Principal Rights (Sections 11–14)</h2>
<p>Under the DPDP Act, you have the right to:</p>
<ul>
<li><strong>Access</strong> – Request a summary of your personal data we hold</li>
<li><strong>Correction</strong> – Request correction of inaccurate or incomplete data</li>
<li><strong>Erasure</strong> – Request erasure of your personal data</li>
<li><strong>Grievance Redressal</strong> – Lodge a complaint with our Grievance Officer</li>
<li><strong>Nomination</strong> – Nominate another person to exercise your rights in the event of death or incapacity</li>
</ul>

<h2>5. Retention Periods</h2>
<p>We retain personal data only for as long as necessary to fulfil the purposes stated above. Specific retention periods are indicated against each purpose.</p>

<h2>6. Breach Notification (Section 25)</h2>
<p>In the event of a data breach that is likely to cause harm, we will notify the Data Protection Board of India and affected Data Principals within 72 hours, as required under the DPDP Act.</p>

<h2>7. Contact – Data Protection Officer</h2>
<p><strong>Name:</strong> ${escapeHtml(config.dpoName) || "N/A"}</p>
<p><strong>Email:</strong> ${escapeHtml(config.dpoEmail) || "N/A"}</p>

<h2>8. Grievance Redressal</h2>
<p><strong>Grievance Officer:</strong> ${escapeHtml(config.grievanceOfficerName) || "N/A"}</p>
<p>You may contact our Grievance Officer for any complaints regarding our processing of your personal data. We will endeavour to resolve grievances within 30 days.</p>

${config.crossBorderTransfer ? `<h2>9. Cross-Border Transfer</h2>
<p>We may transfer your personal data to processors located outside India. Such transfers will be made only to jurisdictions deemed adequate by the Central Government or under appropriate safeguards as prescribed under the DPDP Act.</p>` : ""}

${config.childrenData ? `<h2>${config.crossBorderTransfer ? "10" : "9"}. Children's Data</h2>
<p>We do not knowingly process personal data of children below 18 years without verifiable parental consent, as required under Section 9 of the DPDP Act.</p>` : ""}

<h2>${config.crossBorderTransfer || config.childrenData ? "10" : "9"}. Third-Party Processors</h2>
<p>We engage the following third-party processors who may process your personal data on our behalf:</p>
<ul>${processors}</ul>
`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tool } = body;

    if (tool === "readiness-score") {
      const answers = body.answers as Record<string, string>;
      const categories: ReadinessScore["categories"] = {
        consent_management: 0,
        data_mapping: 0,
        grievance_redressal: 0,
        breach_notification: 0,
        security_safeguards: 0,
        children_data: 0,
      };

      for (const cat of Object.keys(QUESTIONS_CONFIG) as (keyof ReadinessScore["categories"])[]) {
        const config = QUESTIONS_CONFIG[cat];
        let catScore = 0;
        for (let i = 0; i < config.length; i++) {
          const ans = answers[`${cat}_${i}`];
          catScore += config[i].scores[ans ?? ""] ?? 0;
        }
        const catMax = config.reduce((a, c) => a + c.max, 0);
        categories[cat] = catMax > 0 ? Math.round((catScore / catMax) * 100) : 0;
      }

      const overall = Math.round(
        Object.values(categories).reduce((a, b) => a + b, 0) / 6
      );

      const lowCategories = (
        Object.entries(categories) as [keyof typeof categories, number][]
      ).filter(([, v]) => v < 70);

      const recommendations: string[] = [];
      if (lowCategories.some(([k]) => k === "consent_management"))
        recommendations.push(
          "Implement explicit consent collection before processing personal data"
        );
      if (lowCategories.some(([k]) => k === "data_mapping"))
        recommendations.push(
          "Conduct a comprehensive data mapping exercise across all systems"
        );
      if (lowCategories.some(([k]) => k === "grievance_redressal"))
        recommendations.push(
          "Set up a grievance redressal mechanism with SLA tracking"
        );
      if (lowCategories.some(([k]) => k === "breach_notification"))
        recommendations.push(
          "Establish breach detection and 72-hour notification procedures"
        );
      if (lowCategories.some(([k]) => k === "security_safeguards"))
        recommendations.push(
          "Implement encryption and RBAC for personal data"
        );
      if (lowCategories.some(([k]) => k === "children_data"))
        recommendations.push(
          "Verify parental consent and restrict tracking for minors"
        );
      if (recommendations.length < 3) {
        recommendations.push(
          "Consider automated compliance monitoring with Yojak"
        );
        recommendations.push("Schedule regular compliance audits");
      }

      const result: ReadinessScore = {
        overall,
        categories,
        recommendations: recommendations.slice(0, 5),
        generated_at: new Date().toISOString(),
      };

      return NextResponse.json(result);
    }

    if (tool === "policy-generator") {
      const config = body.config;
      if (!config) {
        return NextResponse.json(
          { error: "Missing config" },
          { status: 400 }
        );
      }
      const policy = generatePolicy(config);
      return NextResponse.json({ policy });
    }

    if (tool === "cookie-scanner") {
      const _url = body.url;
      return NextResponse.json({
        cookies: MOCK_COOKIES,
        url: _url ?? "",
      });
    }

    return NextResponse.json(
      { error: "Unknown tool" },
      { status: 400 }
    );
  } catch (e) {
    console.error("Tools API error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
