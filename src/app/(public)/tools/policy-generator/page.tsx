"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "E-commerce",
  "Education",
  "Manufacturing",
  "Other",
] as const;

const DATA_TYPES = {
  "Identity Data": [
    "Names",
    "Date of Birth",
    "Aadhaar Numbers",
    "PAN Numbers",
  ],
  "Contact Data": ["Email Addresses", "Phone Numbers", "Physical Addresses"],
  "Sensitive Data": ["Health Data", "Biometric Data", "Payment/Financial Info"],
  "Technical Data": [
    "Location Data",
    "IP Addresses",
    "Device Information",
    "Browsing History",
  ],
} as const;

const PURPOSES = [
  "Service Delivery",
  "Account Management",
  "Payment Processing",
  "Customer Support",
  "Analytics & Improvement",
  "Marketing Communications",
  "Legal Compliance",
  "Fraud Prevention",
  "Third-Party Sharing",
  "Personalization",
] as const;

const RETENTION_OPTIONS = [
  "30 days",
  "90 days",
  "1 year",
  "3 years",
  "7 years",
] as const;

type PolicyConfig = {
  orgName: string;
  websiteUrl: string;
  industry: string;
  gstin: string;
  dataTypes: string[];
  purposes: Record<string, string>;
  dpoName: string;
  dpoEmail: string;
  grievanceOfficerName: string;
  childrenData: boolean;
  crossBorderTransfer: boolean;
  thirdPartyProcessors: string;
};

const STEPS = [
  "Business Info",
  "Data Collection",
  "Processing Purposes",
  "Additional Settings",
];

export default function PolicyGeneratorPage() {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<PolicyConfig>({
    orgName: "",
    websiteUrl: "",
    industry: "",
    gstin: "",
    dataTypes: [],
    purposes: {},
    dpoName: "",
    dpoEmail: "",
    grievanceOfficerName: "",
    childrenData: false,
    crossBorderTransfer: false,
    thirdPartyProcessors: "",
  });
  const [generatedPolicy, setGeneratedPolicy] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateConfig<K extends keyof PolicyConfig>(
    key: K,
    value: PolicyConfig[K]
  ) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function toggleDataType(type: string) {
    setConfig((prev) => ({
      ...prev,
      dataTypes: prev.dataTypes.includes(type)
        ? prev.dataTypes.filter((t) => t !== type)
        : [...prev.dataTypes, type],
    }));
  }

  function togglePurpose(purpose: string) {
    setConfig((prev) => ({
      ...prev,
      purposes: prev.purposes[purpose]
        ? (() => {
            const { [purpose]: _, ...rest } = prev.purposes;
            return rest;
          })()
        : { ...prev.purposes, [purpose]: "1 year" },
    }));
  }

  function setPurposeRetention(purpose: string, retention: string) {
    setConfig((prev) => ({
      ...prev,
      purposes: { ...prev.purposes, [purpose]: retention },
    }));
  }

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "policy-generator", config }),
      });
      const data = await res.json();
      if (data.policy) setGeneratedPolicy(data.policy);
    } catch {
      setGeneratedPolicy(generatePolicyLocally(config));
    } finally {
      setLoading(false);
    }
  }

  function generatePolicyLocally(c: PolicyConfig): string {
    const purposesList = Object.entries(c.purposes)
      .map(([p, r]) => `<li><strong>${p}</strong> – Retention: ${r}</li>`)
      .join("");
    const dataList = c.dataTypes.map((d) => `<li>${d}</li>`).join("");
    const processors = c.thirdPartyProcessors
      ? c.thirdPartyProcessors
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean)
          .map((p) => `<li>${p}</li>`)
          .join("")
      : "<li>None disclosed</li>";

    return `
<h1>Privacy Policy</h1>
<p><em>Last updated: ${new Date().toLocaleDateString("en-IN")}</em></p>
<p>This Privacy Policy is issued in compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act) and its rules.</p>

<h2>1. Data Fiduciary Details (Section 8)</h2>
<p><strong>Organization:</strong> ${c.orgName}</p>
<p><strong>Website:</strong> ${c.websiteUrl}</p>
<p><strong>Industry:</strong> ${c.industry}</p>
${c.gstin ? `<p><strong>GSTIN:</strong> ${c.gstin}</p>` : ""}

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
<p><strong>Name:</strong> ${c.dpoName || "N/A"}</p>
<p><strong>Email:</strong> ${c.dpoEmail || "N/A"}</p>

<h2>8. Grievance Redressal</h2>
<p><strong>Grievance Officer:</strong> ${c.grievanceOfficerName || "N/A"}</p>
<p>You may contact our Grievance Officer for any complaints regarding our processing of your personal data. We will endeavour to resolve grievances within 30 days.</p>

${c.crossBorderTransfer ? `<h2>9. Cross-Border Transfer</h2>
<p>We may transfer your personal data to processors located outside India. Such transfers will be made only to jurisdictions deemed adequate by the Central Government or under appropriate safeguards as prescribed under the DPDP Act.</p>` : ""}

${c.childrenData ? `<h2>${c.crossBorderTransfer ? "10" : "9"}. Children's Data</h2>
<p>We do not knowingly process personal data of children below 18 years without verifiable parental consent, as required under Section 9 of the DPDP Act.</p>` : ""}

<h2>${c.crossBorderTransfer || c.childrenData ? "10" : "9"}. Third-Party Processors</h2>
<p>We engage the following third-party processors who may process your personal data on our behalf:</p>
<ul>${processors}</ul>
`;
  }

  function copyToClipboard() {
    if (!generatedPolicy) return;
    const plain = generatedPolicy.replace(/<[^>]*>/g, "\n").replace(/\n+/g, "\n");
    navigator.clipboard.writeText(plain);
  }

  function downloadHtml() {
    if (!generatedPolicy) return;
    const blob = new Blob(
      [`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Privacy Policy</title></head><body>${generatedPolicy}</body></html>`],
      { type: "text/html" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "privacy-policy.html";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Free DPDP Privacy Policy Generator
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Generate a legally compliant privacy policy for your business in under
          2 minutes
        </p>
      </div>

      {!generatedPolicy ? (
        <Card className="mt-10">
          <CardHeader>
            <div className="mb-4 flex gap-2">
              {STEPS.map((s, i) => (
                <div key={s} className="flex-1">
                  <div
                    className={`h-2 rounded-full ${i + 1 <= step ? "bg-indigo-600" : "bg-slate-200"}`}
                  />
                  <p
                    className={`mt-1 text-xs font-medium ${i + 1 === step ? "text-indigo-600" : "text-slate-500"}`}
                  >
                    {s}
                  </p>
                </div>
              ))}
            </div>
            <CardTitle>Step {step}: {STEPS[step - 1]}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <>
                <Input
                  label="Organization Name"
                  value={config.orgName}
                  onChange={(e) => updateConfig("orgName", e.target.value)}
                  placeholder="Acme Pvt Ltd"
                />
                <Input
                  label="Website URL"
                  value={config.websiteUrl}
                  onChange={(e) => updateConfig("websiteUrl", e.target.value)}
                  placeholder="https://example.com"
                />
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Industry
                  </label>
                  <select
                    value={config.industry}
                    onChange={(e) => updateConfig("industry", e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select industry</option>
                    {INDUSTRIES.map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="GSTIN (optional)"
                  value={config.gstin}
                  onChange={(e) => updateConfig("gstin", e.target.value)}
                  placeholder="22AAAAA0000A1Z5"
                />
              </>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {Object.entries(DATA_TYPES).map(([category, types]) => (
                  <div key={category}>
                    <p className="mb-2 font-medium text-slate-700">{category}</p>
                    <div className="flex flex-wrap gap-4">
                      {types.map((type) => (
                        <label
                          key={type}
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            checked={config.dataTypes.includes(type)}
                            onChange={() => toggleDataType(type)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-slate-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                {PURPOSES.map((purpose) => (
                  <div
                    key={purpose}
                    className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 p-4"
                  >
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!config.purposes[purpose]}
                        onChange={() => togglePurpose(purpose)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {purpose}
                      </span>
                    </label>
                    {config.purposes[purpose] && (
                      <select
                        value={config.purposes[purpose]}
                        onChange={(e) =>
                          setPurposeRetention(purpose, e.target.value)
                        }
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                      >
                        {RETENTION_OPTIONS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            )}

            {step === 4 && (
              <>
                <Input
                  label="DPO Name"
                  value={config.dpoName}
                  onChange={(e) => updateConfig("dpoName", e.target.value)}
                  placeholder="Data Protection Officer"
                />
                <Input
                  label="DPO Email"
                  type="email"
                  value={config.dpoEmail}
                  onChange={(e) => updateConfig("dpoEmail", e.target.value)}
                  placeholder="dpo@company.com"
                />
                <Input
                  label="Grievance Officer Name"
                  value={config.grievanceOfficerName}
                  onChange={(e) =>
                    updateConfig("grievanceOfficerName", e.target.value)
                  }
                  placeholder="Grievance Officer"
                />
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-700">
                    Do you process children&apos;s data?
                  </span>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.childrenData}
                      onChange={(e) =>
                        updateConfig("childrenData", e.target.checked)
                      }
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Yes
                  </label>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-700">
                    Do you share data cross-border?
                  </span>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.crossBorderTransfer}
                      onChange={(e) =>
                        updateConfig("crossBorderTransfer", e.target.checked)
                      }
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Yes
                  </label>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Third-party processors (comma-separated)
                  </label>
                  <textarea
                    value={config.thirdPartyProcessors}
                    onChange={(e) =>
                      updateConfig("thirdPartyProcessors", e.target.value)
                    }
                    placeholder="Google Analytics, Stripe, AWS..."
                    rows={3}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              Back
            </Button>
            {step < 4 ? (
              <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
            ) : (
              <Button onClick={handleGenerate} disabled={loading}>
                {loading ? "Generating..." : "Generate Policy"}
              </Button>
            )}
          </CardFooter>
        </Card>
      ) : (
        <Card className="mt-10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Generated Privacy Policy</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                Copy to Clipboard
              </Button>
              <Button variant="outline" size="sm" onClick={downloadHtml}>
                Download as HTML
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="max-h-[500px] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-6 [&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_ul]:list-inside [&_ul]:space-y-1 [&_li]:text-slate-700 [&_p]:mb-2 [&_p]:text-slate-700"
              dangerouslySetInnerHTML={{ __html: generatedPolicy }}
            />
          </CardContent>
          <CardFooter>
            <Link href="/signup" className="w-full">
              <Button className="w-full" size="lg">
                Want automated compliance monitoring? Start your free trial
              </Button>
            </Link>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
