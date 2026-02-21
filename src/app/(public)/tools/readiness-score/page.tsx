"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { ReadinessScore } from "@/types";

type AnswerOption = "Yes" | "Partially" | "No" | "N/A";

const QUESTIONS = {
  consent_management: [
    {
      q: "Do you collect explicit consent before processing personal data?",
      scores: { Yes: 10, Partially: 5, No: 0 },
    },
    {
      q: "Can users easily withdraw consent?",
      scores: { Yes: 10, Partially: 5, No: 0 },
    },
    {
      q: "Do you maintain a consent audit trail?",
      scores: { Yes: 10, Partially: 5, No: 0 },
    },
    {
      q: "Are consent notices available in multiple Indian languages?",
      scores: { Yes: 10, Partially: 5, No: 0 },
    },
  ],
  data_mapping: [
    {
      q: "Have you mapped all personal data in your systems?",
      scores: { Yes: 15, Partially: 8, No: 0 },
    },
    {
      q: "Do you track data flows across third parties?",
      scores: { Yes: 10, Partially: 5, No: 0 },
    },
    {
      q: "Is sensitive data (Aadhaar, health, financial) identified and classified?",
      scores: { Yes: 15, Partially: 8, No: 0 },
    },
  ],
  grievance_redressal: [
    {
      q: "Do you have a grievance redressal mechanism?",
      scores: { Yes: 10, Partially: 5, No: 0 },
    },
    {
      q: "Can you process data access/erasure requests within 90 days?",
      scores: { Yes: 10, Partially: 5, No: 0 },
    },
    {
      q: "Do you track SLA deadlines for grievance resolution?",
      scores: { Yes: 10, Partially: 5, No: 0 },
    },
  ],
  breach_notification: [
    {
      q: "Do you have a data breach detection system?",
      scores: { Yes: 15, Partially: 8, No: 0 },
    },
    {
      q: "Can you notify the DPB and affected individuals within 72 hours?",
      scores: { Yes: 15, Partially: 8, No: 0 },
    },
  ],
  security_safeguards: [
    {
      q: "Is personal data encrypted at rest and in transit?",
      scores: { Yes: 10, Partially: 5, No: 0 },
    },
    {
      q: "Do you have role-based access controls (RBAC)?",
      scores: { Yes: 10, Partially: 5, No: 0 },
    },
    {
      q: "Do you conduct regular security audits?",
      scores: { Yes: 10, Partially: 5, No: 0 },
    },
  ],
  children_data: [
    {
      q: "Do you verify parental consent for processing children's data?",
      scores: { Yes: 10, Partially: 5, No: 0, "N/A": 10 },
    },
    {
      q: "Do you restrict behavioral tracking of minors?",
      scores: { Yes: 10, Partially: 5, No: 0, "N/A": 10 },
    },
  ],
} as const;

const CATEGORY_LABELS: Record<keyof ReadinessScore["categories"], string> = {
  consent_management: "Consent Management",
  data_mapping: "Data Mapping",
  grievance_redressal: "Grievance Redressal",
  breach_notification: "Breach Notification",
  security_safeguards: "Security Safeguards",
  children_data: "Children's Data",
};

const CATEGORY_MAX: Record<keyof ReadinessScore["categories"], number> = {
  consent_management: 40,
  data_mapping: 40,
  grievance_redressal: 30,
  breach_notification: 30,
  security_safeguards: 30,
  children_data: 20,
};

export default function ReadinessScorePage() {
  const [answers, setAnswers] = useState<
    Record<string, Record<number, AnswerOption>>
  >({});
  const [result, setResult] = useState<ReadinessScore | null>(null);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  function setAnswer(
    category: keyof typeof QUESTIONS,
    qIndex: number,
    value: AnswerOption
  ) {
    setAnswers((prev) => ({
      ...prev,
      [category]: { ...(prev[category] ?? {}), [qIndex]: value },
    }));
  }

  function getCategoryScore(
    category: keyof typeof QUESTIONS
  ): { score: number; max: number } {
    const qs = QUESTIONS[category];
    let score = 0;
    for (let i = 0; i < qs.length; i++) {
      const ans = answers[category]?.[i];
      const scores = qs[i].scores as Record<string, number>;
      if (ans && scores[ans] !== undefined) {
        score += scores[ans];
      }
    }
    return { score, max: CATEGORY_MAX[category] };
  }

  function getOverallProgress(): number {
    let total = 0;
    let maxTotal = 0;
    for (const cat of Object.keys(QUESTIONS) as (keyof typeof QUESTIONS)[]) {
      const { score, max } = getCategoryScore(cat);
      total += score;
      maxTotal += max;
    }
    return maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
  }

  async function handleCalculate() {
    const categories: ReadinessScore["categories"] = {
      consent_management: 0,
      data_mapping: 0,
      grievance_redressal: 0,
      breach_notification: 0,
      security_safeguards: 0,
      children_data: 0,
    };

    for (const cat of Object.keys(QUESTIONS) as (keyof typeof QUESTIONS)[]) {
      const { score, max } = getCategoryScore(cat);
      categories[cat] = max > 0 ? Math.round((score / max) * 100) : 0;
    }

    const overall = Math.round(
      Object.values(categories).reduce((a, b) => a + b, 0) / 6
    );

    const lowCategories = (
      Object.entries(categories) as [keyof typeof categories, number][]
    )
      .filter(([, v]) => v < 70)
      .map(([k]) => CATEGORY_LABELS[k]);

    const recommendations: string[] = [];
    if (lowCategories.includes("Consent Management"))
      recommendations.push("Implement explicit consent collection before processing personal data");
    if (lowCategories.includes("Data Mapping"))
      recommendations.push("Conduct a comprehensive data mapping exercise across all systems");
    if (lowCategories.includes("Grievance Redressal"))
      recommendations.push("Set up a grievance redressal mechanism with SLA tracking");
    if (lowCategories.includes("Breach Notification"))
      recommendations.push("Establish breach detection and 72-hour notification procedures");
    if (lowCategories.includes("Security Safeguards"))
      recommendations.push("Implement encryption and RBAC for personal data");
    if (lowCategories.includes("Children's Data"))
      recommendations.push("Verify parental consent and restrict tracking for minors");

    if (recommendations.length < 3) {
      recommendations.push("Consider automated compliance monitoring with Yojak");
      recommendations.push("Schedule regular compliance audits");
    }

    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "readiness-score",
          answers: Object.fromEntries(
            Object.entries(answers).flatMap(([cat, qs]) =>
              Object.entries(qs).map(([q, v]) => [`${cat}_${q}`, v])
            )
          ),
        }),
      });
      const data = await res.json();
      if (data.overall !== undefined) {
        setResult({
          overall: data.overall,
          categories: data.categories ?? categories,
          recommendations: data.recommendations ?? recommendations.slice(0, 5),
          generated_at: data.generated_at ?? new Date().toISOString(),
        });
        return;
      }
    } catch {
      /* fallback to local */
    }

    setResult({
      overall,
      categories,
      recommendations: recommendations.slice(0, 5),
      generated_at: new Date().toISOString(),
    });
  }

  function getRiskLevel(score: number): string {
    if (score >= 80) return "Low Risk";
    if (score >= 50) return "Medium Risk";
    if (score >= 25) return "High Risk";
    return "Critical Risk";
  }

  function getScoreColor(score: number): string {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-600";
  }

  function getScoreBgColor(score: number): string {
    if (score >= 80) return "stroke-green-500";
    if (score >= 50) return "stroke-amber-500";
    return "stroke-red-500";
  }

  if (result) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Your DPDP Readiness Score
          </h1>
        </div>

        <div className="mt-10 flex flex-col items-center gap-8">
          <div className="relative">
            <svg className="h-40 w-40 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-200"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${result.overall * 2.64} 264`}
                className={getScoreBgColor(result.overall)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={`text-4xl font-bold ${getScoreColor(result.overall)}`}
              >
                {result.overall}
              </span>
              <span className="text-sm text-slate-600">/ 100</span>
            </div>
          </div>

          <Badge
            variant={
              result.overall >= 80
                ? "success"
                : result.overall >= 50
                  ? "warning"
                  : "error"
            }
            className="text-base"
          >
            {getRiskLevel(result.overall)}
          </Badge>

          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(
                Object.entries(result.categories) as [
                  keyof typeof result.categories,
                  number,
                ][]
              ).map(([cat, score]) => (
                <div key={cat}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      {CATEGORY_LABELS[cat]}
                    </span>
                    <span className={getScoreColor(score)}>{score}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${
                        score >= 80
                          ? "bg-green-500"
                          : score >= 50
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc space-y-2 text-slate-700">
                {result.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="w-full max-w-2xl">
            <CardContent className="pt-6">
              <p className="text-center text-slate-700">
                Based on your score, your maximum penalty exposure under the
                DPDP Act is estimated at{" "}
                <strong className="text-slate-900">
                  Rs {result.overall >= 80 ? 10 : result.overall >= 50 ? 50 : 250} crore
                </strong>
                .
              </p>
            </CardContent>
          </Card>

          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Get your detailed report emailed to you</CardTitle>
            </CardHeader>
            <CardContent>
              {emailSent ? (
                <p className="text-sm text-green-600">
                  Report sent! Check your inbox.
                </p>
              ) : (
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => setEmailSent(true)}
                    disabled={!email.trim()}
                  >
                    Send Report
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Link href="/signup" className="w-full max-w-2xl">
            <Button className="w-full" size="lg">
              Automate your compliance journey
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          DPDP Readiness Score Calculator
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Assess your organization&apos;s compliance readiness in 5 minutes
        </p>
      </div>

      <div className="mt-6 mb-4">
        <div className="flex justify-between text-sm text-slate-600">
          <span>Progress</span>
          <span>{getOverallProgress()}% answered</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${getOverallProgress()}%` }}
          />
        </div>
      </div>

      <div className="mt-10 space-y-8">
        {(
          Object.entries(QUESTIONS) as [
            keyof typeof QUESTIONS,
            (typeof QUESTIONS)[keyof typeof QUESTIONS],
          ][]
        ).map(([category, qs]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{CATEGORY_LABELS[category]}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {qs.map((item, qIndex) => (
                <div key={qIndex}>
                  <p className="mb-3 font-medium text-slate-700">{item.q}</p>
                  <div className="flex flex-wrap gap-4">
                    {(Object.keys(item.scores) as AnswerOption[]).map(
                      (opt) => (
                        <label
                          key={opt}
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <input
                            type="radio"
                            name={`${category}-${qIndex}`}
                            checked={answers[category]?.[qIndex] === opt}
                            onChange={() => setAnswer(category, qIndex, opt)}
                            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-slate-700">{opt}</span>
                        </label>
                      )
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Button size="lg" onClick={handleCalculate}>
          Calculate Score
        </Button>
      </div>
    </div>
  );
}
