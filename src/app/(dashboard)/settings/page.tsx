"use client";

import { useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Organization } from "@/types";

const MOCK_ORG: Organization = {
  id: "org-1",
  name: "Acme Technologies Pvt Ltd",
  gstin: "29AABCT1234M1Z5",
  industry: "Technology / SaaS",
  size: "medium",
  created_at: "2024-06-01T00:00:00Z",
  updated_at: "2025-02-21T00:00:00Z",
};

const MOCK_API_KEY = "dpdp_key_placeholder_replace_me";

const POSITION_OPTIONS = [
  "bottom-left",
  "bottom-right",
  "top-left",
  "top-right",
] as const;

const LANGUAGE_OPTIONS = [
  { id: "en", label: "English" },
  { id: "hi", label: "Hindi" },
  { id: "ta", label: "Tamil" },
  { id: "te", label: "Telugu" },
  { id: "mr", label: "Marathi" },
];

export default function SettingsPage() {
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [position, setPosition] = useState<(typeof POSITION_OPTIONS)[number]>(
    "bottom-right"
  );
  const [languages, setLanguages] = useState<string[]>(["en"]);
  const [notifications, setNotifications] = useState({
    new_grievance: true,
    sla_approaching: true,
    consent_withdrawn: true,
    data_breach: true,
  });
  const [retentionDays, setRetentionDays] = useState(2555);
  const [autoDelete, setAutoDelete] = useState(true);
  const [copied, setCopied] = useState(false);

  const toggleLanguage = (id: string) => {
    setLanguages((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(MOCK_API_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const widgetSnippet = `<script src="https://cdn.dpdpshield.com/widget.js" data-org-id="${MOCK_ORG.id}" data-color="${primaryColor}" data-position="${position}" data-languages="${languages.join(",")}"></script>`;

  return (
    <div className="space-y-6">
      {/* Organization Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Profile</CardTitle>
          <CardDescription>
            Your organization details for DPDP compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Organization Name"
            value={MOCK_ORG.name}
            readOnly
            className="bg-gray-50"
          />
          <Input
            label="GSTIN"
            value={MOCK_ORG.gstin}
            readOnly
            className="bg-gray-50"
          />
          <Input
            label="Industry"
            value={MOCK_ORG.industry}
            readOnly
            className="bg-gray-50"
          />
          <Input
            label="Organization Size"
            value={MOCK_ORG.size}
            readOnly
            className="bg-gray-50 capitalize"
          />
        </CardContent>
      </Card>

      {/* Consent Widget Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Consent Widget Configuration</CardTitle>
          <CardDescription>
            Customize the consent banner appearance and behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Primary Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-lg border border-gray-300"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#6366f1"
                className="font-mono"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Position
            </label>
            <select
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={position}
              onChange={(e) =>
                setPosition(e.target.value as (typeof POSITION_OPTIONS)[number])
              }
            >
              {POSITION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.replace("-", " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Languages
            </label>
            <div className="flex flex-wrap gap-3">
              {LANGUAGE_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={languages.includes(opt.id)}
                    onChange={() => toggleLanguage(opt.id)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Widget Preview Snippet
            </label>
            <pre className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-gray-800 overflow-x-auto">
              <code>{widgetSnippet}</code>
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Email alerts for compliance events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              key: "new_grievance" as const,
              label: "New grievance filed",
            },
            {
              key: "sla_approaching" as const,
              label: "SLA deadline approaching",
            },
            {
              key: "consent_withdrawn" as const,
              label: "Consent withdrawn by data principal",
            },
            {
              key: "data_breach" as const,
              label: "Data breach detected",
            },
          ].map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg border border-gray-100 p-4"
            >
              <span className="text-sm font-medium text-gray-900">{label}</span>
              <button
                type="button"
                role="switch"
                aria-checked={notifications[key]}
                onClick={() =>
                  setNotifications((prev) => ({
                    ...prev,
                    [key]: !prev[key],
                  }))
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  notifications[key] ? "bg-indigo-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                    notifications[key] ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Use API keys to integrate with our consent and grievance APIs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              value="sk_live_••••••••••••••••••••••••••••••••"
              readOnly
              className="font-mono bg-gray-50"
            />
            <Button variant="outline" onClick={copyApiKey}>
              <Copy className="mr-2 h-4 w-4" />
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card>
        <CardHeader>
          <CardTitle>Data Retention</CardTitle>
          <CardDescription>
            Configure how long personal data is retained
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Retention Period (days)"
            type="number"
            min={1}
            value={retentionDays}
            onChange={(e) =>
              setRetentionDays(parseInt(e.target.value, 10) || 2555)
            }
          />
          <div className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Auto-delete expired data
              </p>
              <p className="text-xs text-gray-500">
                Automatically delete data after retention period expires
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoDelete}
              onClick={() => setAutoDelete((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                autoDelete ? "bg-indigo-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                  autoDelete ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
