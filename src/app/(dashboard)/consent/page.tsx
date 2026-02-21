"use client";

import { useState } from "react";
import {
  Plus,
  Eye,
  RotateCcw,
  Pencil,
  Trash2,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import type { ConsentRecord, ConsentPurpose } from "@/types";

const MOCK_PURPOSES: ConsentPurpose[] = [
  {
    id: "p1",
    org_id: "org-1",
    code: "MARKETING",
    title: "Marketing Communications",
    description:
      "Send promotional emails, SMS, and push notifications about products and offers.",
    legal_basis: "Consent",
    retention_period_days: 730,
    is_mandatory: false,
    created_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "p2",
    org_id: "org-1",
    code: "ANALYTICS",
    title: "Analytics & Insights",
    description:
      "Process data for analytics, usage patterns, and product improvement.",
    legal_basis: "Legitimate Interest",
    retention_period_days: 365,
    is_mandatory: false,
    created_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "p3",
    org_id: "org-1",
    code: "SERVICE",
    title: "Service Delivery",
    description:
      "Essential data processing for account creation, authentication, and core service delivery.",
    legal_basis: "Contract",
    retention_period_days: 2555,
    is_mandatory: true,
    created_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "p4",
    org_id: "org-1",
    code: "THIRD_PARTY",
    title: "Third-Party Sharing",
    description:
      "Share data with verified partners for fraud prevention and compliance.",
    legal_basis: "Consent",
    retention_period_days: 365,
    is_mandatory: false,
    created_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "p5",
    org_id: "org-1",
    code: "PAYMENT",
    title: "Payment Processing",
    description:
      "Process payment information for transactions and refunds.",
    legal_basis: "Contract",
    retention_period_days: 2555,
    is_mandatory: true,
    created_at: "2025-01-15T10:00:00Z",
  },
];

const MOCK_CONSENTS: ConsentRecord[] = [
  {
    id: "c1",
    org_id: "org-1",
    data_principal_id: "dp_8f3a2b1c4d5e6f7a",
    purpose_id: "p1",
    purpose_description: "Marketing Communications",
    consent_status: "active",
    consent_method: "explicit_click",
    session_id: "sess_001",
    granted_at: "2025-02-18T10:30:00Z",
    metadata: {},
  },
  {
    id: "c2",
    org_id: "org-1",
    data_principal_id: "dp_a1b2c3d4e5f6g7h",
    purpose_id: "p2",
    purpose_description: "Analytics & Insights",
    consent_status: "active",
    consent_method: "toggle",
    session_id: "sess_002",
    granted_at: "2025-02-19T14:20:00Z",
    metadata: {},
  },
  {
    id: "c3",
    org_id: "org-1",
    data_principal_id: "dp_9e8d7c6b5a4f3e",
    purpose_id: "p3",
    purpose_description: "Service Delivery",
    consent_status: "active",
    consent_method: "form_submission",
    session_id: "sess_003",
    granted_at: "2025-02-17T09:15:00Z",
    metadata: {},
  },
  {
    id: "c4",
    org_id: "org-1",
    data_principal_id: "dp_1a2b3c4d5e6f7g",
    purpose_id: "p4",
    purpose_description: "Third-Party Sharing",
    consent_status: "withdrawn",
    consent_method: "explicit_click",
    session_id: "sess_004",
    granted_at: "2025-02-10T11:00:00Z",
    withdrawn_at: "2025-02-20T16:45:00Z",
    metadata: {},
  },
  {
    id: "c5",
    org_id: "org-1",
    data_principal_id: "dp_8h7g6f5e4d3c2b",
    purpose_id: "p5",
    purpose_description: "Payment Processing",
    consent_status: "active",
    consent_method: "form_submission",
    session_id: "sess_005",
    granted_at: "2025-02-15T13:30:00Z",
    metadata: {},
  },
  {
    id: "c6",
    org_id: "org-1",
    data_principal_id: "dp_2b3c4d5e6f7g8h",
    purpose_id: "p1",
    purpose_description: "Marketing Communications",
    consent_status: "expired",
    consent_method: "explicit_click",
    session_id: "sess_006",
    granted_at: "2024-08-01T10:00:00Z",
    expires_at: "2025-02-01T10:00:00Z",
    metadata: {},
  },
  {
    id: "c7",
    org_id: "org-1",
    data_principal_id: "dp_3c4d5e6f7g8h9i",
    purpose_id: "p2",
    purpose_description: "Analytics & Insights",
    consent_status: "active",
    consent_method: "toggle",
    session_id: "sess_007",
    granted_at: "2025-02-20T08:00:00Z",
    metadata: {},
  },
  {
    id: "c8",
    org_id: "org-1",
    data_principal_id: "dp_4d5e6f7g8h9i0j",
    purpose_id: "p3",
    purpose_description: "Service Delivery",
    consent_status: "active",
    consent_method: "form_submission",
    session_id: "sess_008",
    granted_at: "2025-02-16T12:00:00Z",
    metadata: {},
  },
  {
    id: "c9",
    org_id: "org-1",
    data_principal_id: "dp_5e6f7g8h9i0j1k",
    purpose_id: "p1",
    purpose_description: "Marketing Communications",
    consent_status: "active",
    consent_method: "explicit_click",
    session_id: "sess_009",
    granted_at: "2025-02-21T09:30:00Z",
    metadata: {},
  },
  {
    id: "c10",
    org_id: "org-1",
    data_principal_id: "dp_6f7g8h9i0j1k2l",
    purpose_id: "p4",
    purpose_description: "Third-Party Sharing",
    consent_status: "pending",
    consent_method: "explicit_click",
    session_id: "sess_010",
    granted_at: "2025-02-21T11:00:00Z",
    metadata: {},
  },
];

type ConsentLogEvent = {
  id: string;
  consent_id: string;
  event: "granted" | "withdrawn" | "expired";
  data_principal_id: string;
  purpose: string;
  timestamp: string;
};

const MOCK_CONSENT_LOGS: ConsentLogEvent[] = [
  {
    id: "log1",
    consent_id: "c9",
    event: "granted",
    data_principal_id: "dp_5e6f7g8h9i0j1k",
    purpose: "Marketing Communications",
    timestamp: "2025-02-21T09:30:00Z",
  },
  {
    id: "log2",
    consent_id: "c4",
    event: "withdrawn",
    data_principal_id: "dp_1a2b3c4d5e6f7g",
    purpose: "Third-Party Sharing",
    timestamp: "2025-02-20T16:45:00Z",
  },
  {
    id: "log3",
    consent_id: "c7",
    event: "granted",
    data_principal_id: "dp_3c4d5e6f7g8h9i",
    purpose: "Analytics & Insights",
    timestamp: "2025-02-20T08:00:00Z",
  },
  {
    id: "log4",
    consent_id: "c6",
    event: "expired",
    data_principal_id: "dp_2b3c4d5e6f7g8h",
    purpose: "Marketing Communications",
    timestamp: "2025-02-01T10:00:00Z",
  },
  {
    id: "log5",
    consent_id: "c5",
    event: "granted",
    data_principal_id: "dp_8h7g6f5e4d3c2b",
    purpose: "Payment Processing",
    timestamp: "2025-02-15T13:30:00Z",
  },
];

const LEGAL_BASIS_OPTIONS = [
  "Consent",
  "Contract",
  "Legal Obligation",
  "Legitimate Interest",
  "Vital Interests",
  "Public Task",
];

function truncateId(id: string, len = 12) {
  if (id.length <= len) return id;
  return `${id.slice(0, 6)}...${id.slice(-4)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadgeVariant(
  status: ConsentRecord["consent_status"]
): "default" | "success" | "warning" | "error" | "info" {
  switch (status) {
    case "active":
      return "success";
    case "withdrawn":
    case "expired":
      return "error";
    case "pending":
      return "warning";
    default:
      return "default";
  }
}

export default function ConsentPage() {
  const [activeTab, setActiveTab] = useState<
    "active" | "purposes" | "logs"
  >("active");
  const [modalOpen, setModalOpen] = useState(false);
  const [consents, setConsents] = useState<ConsentRecord[]>(MOCK_CONSENTS);
  const [purposes, setPurposes] = useState<ConsentPurpose[]>(MOCK_PURPOSES);

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    legal_basis: "Consent",
    retention_period_days: 365,
    is_mandatory: false,
  });

  const handleAddPurpose = () => {
    const newPurpose: ConsentPurpose = {
      id: `p${purposes.length + 1}`,
      org_id: "org-1",
      code: formData.code,
      title: formData.title,
      description: formData.description,
      legal_basis: formData.legal_basis,
      retention_period_days: formData.retention_period_days,
      is_mandatory: formData.is_mandatory,
      created_at: new Date().toISOString(),
    };
    setPurposes([...purposes, newPurpose]);
    setFormData({
      code: "",
      title: "",
      description: "",
      legal_basis: "Consent",
      retention_period_days: 365,
      is_mandatory: false,
    });
    setModalOpen(false);
  };

  const handleWithdraw = (id: string) => {
    setConsents((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              consent_status: "withdrawn" as const,
              withdrawn_at: new Date().toISOString(),
            }
          : c
      )
    );
  };

  const getConsentCount = (purposeId: string) =>
    consents.filter(
      (c) => c.purpose_id === purposeId && c.consent_status === "active"
    ).length;

  const tabs = [
    { id: "active" as const, label: "Active Consents" },
    { id: "purposes" as const, label: "Purposes" },
    { id: "logs" as const, label: "Consent Logs" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Consent Manager</h2>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Purpose
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Active Consents Tab */}
      {activeTab === "active" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-600">
                    <th className="px-6 py-4 font-medium">Data Principal ID</th>
                    <th className="px-6 py-4 font-medium">Purpose</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Method</th>
                    <th className="px-6 py-4 font-medium">Granted At</th>
                    <th className="px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {consents.map((c) => (
                    <tr key={c.id} className="border-b border-gray-100">
                      <td className="px-6 py-4 font-mono text-gray-900">
                        {truncateId(c.data_principal_id)}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {c.purpose_description}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusBadgeVariant(c.consent_status)}>
                          {c.consent_status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 capitalize text-gray-600">
                        {c.consent_method.replace("_", " ")}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(c.granted_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="mr-1 h-3.5 w-3.5" />
                            View
                          </Button>
                          {c.consent_status === "active" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => handleWithdraw(c.id)}
                            >
                              <RotateCcw className="mr-1 h-3.5 w-3.5" />
                              Withdraw
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Purposes Tab */}
      {activeTab === "purposes" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {purposes.map((p) => (
            <Card key={p.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{p.title}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs font-mono text-gray-500">{p.code}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">{p.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="info">{p.legal_basis}</Badge>
                  <span className="text-xs text-gray-500">
                    {p.retention_period_days} days retention
                  </span>
                  {p.is_mandatory && (
                    <Badge variant="warning">Mandatory</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  <strong>{getConsentCount(p.id)}</strong> active consents
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Consent Logs Tab */}
      {activeTab === "logs" && (
        <Card>
          <CardHeader>
            <CardTitle>Consent Audit Log</CardTitle>
            <p className="text-sm text-gray-500">
              Chronological log of all consent events
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MOCK_CONSENT_LOGS.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-4 rounded-lg border border-gray-100 p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                    {log.event === "granted" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : log.event === "withdrawn" ? (
                      <RotateCcw className="h-5 w-5 text-red-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-amber-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">
                      Consent {log.event} — {log.purpose}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      {truncateId(log.data_principal_id)}
                    </p>
                  </div>
                  <span className="text-sm text-gray-600">
                    {formatDate(log.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Purpose Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Purpose"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Code"
            placeholder="e.g. MARKETING"
            value={formData.code}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, code: e.target.value }))
            }
          />
          <Input
            label="Title"
            placeholder="Purpose title"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Purpose description"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Legal Basis
            </label>
            <select
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.legal_basis}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  legal_basis: e.target.value,
                }))
              }
            >
              {LEGAL_BASIS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Retention Period (days)"
            type="number"
            min={1}
            value={formData.retention_period_days}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                retention_period_days: parseInt(e.target.value, 10) || 365,
              }))
            }
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="mandatory"
              checked={formData.is_mandatory}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  is_mandatory: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="mandatory" className="text-sm text-gray-700">
              Mandatory (required for service)
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPurpose}>Add Purpose</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
