"use client";

import { useState, useEffect, useCallback } from "react";
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
} from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useOrg } from "@/hooks/use-org";
import type { ConsentRecord, ConsentPurpose } from "@/types";

type AuditLogEntry = {
  id: string;
  org_id: string;
  consent_id: string;
  event_type: string;
  data_principal_id: string;
  purpose_id: string;
  ip_address: string | null;
  user_agent: string | null;
  event_metadata: Record<string, unknown> | null;
  created_at: string;
};

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
  const supabase = createClient();
  const { orgId, loading: orgLoading } = useOrg();

  const [activeTab, setActiveTab] = useState<
    "active" | "purposes" | "logs"
  >("active");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [purposes, setPurposes] = useState<ConsentPurpose[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    legal_basis: "Consent",
    retention_period_days: 365,
    is_mandatory: false,
  });

  const fetchAuditLogs = useCallback(async () => {
    const { data } = await supabase
      .from("consent_audit_log")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setAuditLogs(data);
  }, [supabase]);

  useEffect(() => {
    if (orgLoading || !orgId) return;

    async function fetchData() {
      setLoading(true);

      const [purposesRes, consentsRes, logsRes] = await Promise.all([
        supabase.from("consent_purposes").select("*"),
        supabase
          .from("consent_records")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("consent_audit_log")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (purposesRes.data) setPurposes(purposesRes.data);
      if (consentsRes.data) setConsents(consentsRes.data);
      if (logsRes.data) setAuditLogs(logsRes.data);

      setLoading(false);
    }

    fetchData();
  }, [orgId, orgLoading, supabase]);

  const handleAddPurpose = async () => {
    if (!orgId) return;

    const { data, error } = await supabase
      .from("consent_purposes")
      .insert({
        org_id: orgId,
        code: formData.code,
        title: formData.title,
        description: formData.description,
        legal_basis: formData.legal_basis,
        retention_period_days: formData.retention_period_days,
        is_mandatory: formData.is_mandatory,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to add purpose:", error.message);
      return;
    }

    setPurposes((prev) => [...prev, data]);
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

  const handleWithdraw = async (id: string) => {
    const { data, error } = await supabase
      .from("consent_records")
      .update({
        consent_status: "withdrawn",
        withdrawn_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Failed to withdraw consent:", error.message);
      return;
    }

    setConsents((prev) => prev.map((c) => (c.id === id ? data : c)));
    await fetchAuditLogs();
  };

  const getConsentCount = (purposeId: string) =>
    consents.filter(
      (c) => c.purpose_id === purposeId && c.consent_status === "active"
    ).length;

  const purposeTitle = (purposeId: string) =>
    purposes.find((p) => p.id === purposeId)?.title ?? purposeId;

  const tabs = [
    { id: "active" as const, label: "Active Consents" },
    { id: "purposes" as const, label: "Purposes" },
    { id: "logs" as const, label: "Consent Logs" },
  ];

  if (orgLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Loading consent data…</p>
      </div>
    );
  }

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
            {consents.length === 0 ? (
              <p className="px-6 py-12 text-center text-gray-500">
                No consent records yet.
              </p>
            ) : (
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
            )}
          </CardContent>
        </Card>
      )}

      {/* Purposes Tab */}
      {activeTab === "purposes" && (
        purposes.length === 0 ? (
          <p className="py-12 text-center text-gray-500">
            No consent purposes defined. Click &quot;Add Purpose&quot; to create one.
          </p>
        ) : (
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
        )
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
            {auditLogs.length === 0 ? (
              <p className="py-12 text-center text-gray-500">
                No audit log entries yet.
              </p>
            ) : (
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center gap-4 rounded-lg border border-gray-100 p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                      {log.event_type === "granted" ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : log.event_type === "withdrawn" ? (
                        <RotateCcw className="h-5 w-5 text-red-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-amber-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">
                        Consent {log.event_type} — {purposeTitle(log.purpose_id)}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        {truncateId(log.data_principal_id)}
                      </p>
                    </div>
                    <span className="text-sm text-gray-600">
                      {formatDate(log.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
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
