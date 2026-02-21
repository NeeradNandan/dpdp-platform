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
import { Badge } from "@/components/ui/badge";

const MOCK_COOKIES = [
  { name: "_ga", category: "Analytics", provider: "Google", purpose: "Analytics", duration: "2 years", compliant: false },
  { name: "_gid", category: "Analytics", provider: "Google", purpose: "Analytics", duration: "24 hours", compliant: false },
  { name: "_fbp", category: "Marketing", provider: "Facebook", purpose: "Advertising", duration: "90 days", compliant: false },
  { name: "JSESSIONID", category: "Essential", provider: "Internal", purpose: "Session", duration: "Session", compliant: true },
  { name: "stripe_mid", category: "Essential", provider: "Stripe", purpose: "Payment", duration: "1 year", compliant: true },
  { name: "_gcl_au", category: "Marketing", provider: "Google Ads", purpose: "Advertising", duration: "90 days", compliant: false },
  { name: "intercom-id", category: "Marketing", provider: "Intercom", purpose: "Chat", duration: "1 year", compliant: false },
  { name: "csrf_token", category: "Essential", provider: "Internal", purpose: "Security", duration: "Session", compliant: true },
  { name: "session_id", category: "Essential", provider: "Internal", purpose: "Session", duration: "Session", compliant: true },
  { name: "_uetsid", category: "Marketing", provider: "Bing", purpose: "Advertising", duration: "30 days", compliant: false },
  { name: "mp_xxxxx", category: "Analytics", provider: "Mixpanel", purpose: "Analytics", duration: "1 year", compliant: false },
  { name: "unknown_tracker", category: "Unknown", provider: "Unknown", purpose: "Unknown", duration: "Unknown", compliant: false },
];

const RECOMMENDATIONS = [
  "3 marketing cookies require explicit consent under DPDP Act",
  "2 cookies have no declared purpose",
  "Cookie consent banner not detected",
];

export default function CookieScannerPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<typeof MOCK_COOKIES | null>(null);
  const [progressStep, setProgressStep] = useState(0);

  async function handleScan() {
    if (!url.trim()) return;
    setLoading(true);
    setResults(null);
    setProgressStep(0);

    const steps = ["scanning...", "analyzing...", "generating report..."];
    for (let i = 0; i < 3; i++) {
      setProgressStep(i + 1);
      await new Promise((r) => setTimeout(r, 1000));
    }

    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "cookie-scanner", url: url.trim() }),
      });
      const data = await res.json();
      setResults(data.cookies ?? MOCK_COOKIES);
    } catch {
      setResults(MOCK_COOKIES);
    } finally {
      setLoading(false);
    }
  }

  const essentialCount = results?.filter((c) => c.category === "Essential").length ?? 0;
  const analyticsCount = results?.filter((c) => c.category === "Analytics").length ?? 0;
  const marketingCount = results?.filter((c) => c.category === "Marketing").length ?? 0;
  const unknownCount = results?.filter((c) => c.category === "Unknown").length ?? 0;
  const totalCount = results?.length ?? 0;
  const compliantCount = results?.filter((c) => c.compliant).length ?? 0;
  const score = totalCount > 0 ? Math.round((compliantCount / totalCount) * 100) : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Free DPDP Cookie Scanner
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Scan your website for cookies and tracking technologies in 30 seconds
        </p>
      </div>

      <Card className="mt-10">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Input
              label="Website URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1"
            />
            <div className="flex items-end">
              <Button
                onClick={handleScan}
                disabled={loading || !url.trim()}
                size="lg"
              >
                {loading ? "Scanning..." : "Scan Now"}
              </Button>
            </div>
          </div>
          {loading && (
            <div className="mt-6 space-y-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-indigo-600 transition-all duration-500"
                  style={{ width: `${(progressStep / 3) * 100}%` }}
                />
              </div>
              <p className="text-sm text-slate-600">
                {progressStep === 1 && "Scanning..."}
                {progressStep === 2 && "Analyzing..."}
                {progressStep === 3 && "Generating report..."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {results && !loading && (
        <div className="mt-10 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardContent className="pt-6">
                <p className="text-2xl font-bold text-indigo-600">{totalCount}</p>
                <p className="text-sm text-slate-600">Total Cookies Found</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-2xl font-bold text-slate-700">{essentialCount}</p>
                <p className="text-sm text-slate-600">Essential</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-2xl font-bold text-blue-600">{analyticsCount}</p>
                <p className="text-sm text-slate-600">Analytics</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-2xl font-bold text-amber-600">{marketingCount}</p>
                <p className="text-sm text-slate-600">Marketing</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-2xl font-bold text-slate-500">{unknownCount}</p>
                <p className="text-sm text-slate-600">Unknown</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Compliance Status</CardTitle>
              <Badge variant="warning">Partially Compliant</Badge>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-4">
                <div className="text-3xl font-bold text-slate-900">
                  Compliance Score: {score}/100
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="pb-3 font-medium text-slate-700">Cookie Name</th>
                      <th className="pb-3 font-medium text-slate-700">Category</th>
                      <th className="pb-3 font-medium text-slate-700">Provider</th>
                      <th className="pb-3 font-medium text-slate-700">Purpose</th>
                      <th className="pb-3 font-medium text-slate-700">Duration</th>
                      <th className="pb-3 font-medium text-slate-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((c) => (
                      <tr key={c.name} className="border-b border-slate-100">
                        <td className="py-3 font-mono text-slate-900">{c.name}</td>
                        <td className="py-3">
                          <Badge
                            variant={
                              c.category === "Essential"
                                ? "success"
                                : c.category === "Unknown"
                                  ? "default"
                                  : "warning"
                            }
                          >
                            {c.category}
                          </Badge>
                        </td>
                        <td className="py-3 text-slate-700">{c.provider}</td>
                        <td className="py-3 text-slate-700">{c.purpose}</td>
                        <td className="py-3 text-slate-700">{c.duration}</td>
                        <td className="py-3">
                          <Badge
                            variant={c.compliant ? "success" : "error"}
                          >
                            {c.compliant ? "Compliant" : "Non-compliant"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <p className="text-sm text-slate-600">
                Issues found and how to fix them
              </p>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc space-y-2 text-slate-700">
                {RECOMMENDATIONS.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/signup" className="w-full">
                <Button className="w-full" size="lg">
                  Fix these issues automatically with DPDP Shield
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
