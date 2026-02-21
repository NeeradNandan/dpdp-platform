"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Search,
  Download,
  Shield,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
} from "lucide-react";
import type { DataMapEntry } from "@/types";

const MOCK_DATA_MAP_ENTRIES: DataMapEntry[] = [
  {
    id: "1",
    org_id: "org-1",
    source_system: "PostgreSQL",
    table_or_collection: "users",
    field_name: "full_name",
    pii_type: "name",
    sensitivity: "medium",
    purpose_ids: ["p1"],
    retention_policy: "5 years",
    encryption_status: "encrypted",
    last_scanned: "2026-02-20T10:30:00Z",
  },
  {
    id: "2",
    org_id: "org-1",
    source_system: "PostgreSQL",
    table_or_collection: "users",
    field_name: "email",
    pii_type: "email",
    sensitivity: "medium",
    purpose_ids: ["p1"],
    retention_policy: "5 years",
    encryption_status: "encrypted",
    last_scanned: "2026-02-20T10:30:00Z",
  },
  {
    id: "3",
    org_id: "org-1",
    source_system: "PostgreSQL",
    table_or_collection: "users",
    field_name: "phone_number",
    pii_type: "phone",
    sensitivity: "high",
    purpose_ids: ["p1"],
    retention_policy: "5 years",
    encryption_status: "encrypted",
    last_scanned: "2026-02-20T10:30:00Z",
  },
  {
    id: "4",
    org_id: "org-1",
    source_system: "PostgreSQL",
    table_or_collection: "kyc_verification",
    field_name: "aadhaar_hash",
    pii_type: "aadhaar",
    sensitivity: "critical",
    purpose_ids: ["p2"],
    retention_policy: "7 years",
    encryption_status: "encrypted",
    last_scanned: "2026-02-19T14:00:00Z",
  },
  {
    id: "5",
    org_id: "org-1",
    source_system: "PostgreSQL",
    table_or_collection: "kyc_verification",
    field_name: "pan_number",
    pii_type: "pan",
    sensitivity: "critical",
    purpose_ids: ["p2"],
    retention_policy: "7 years",
    encryption_status: "encrypted",
    last_scanned: "2026-02-19T14:00:00Z",
  },
  {
    id: "6",
    org_id: "org-1",
    source_system: "PostgreSQL",
    table_or_collection: "users",
    field_name: "date_of_birth",
    pii_type: "dob",
    sensitivity: "high",
    purpose_ids: ["p1"],
    retention_policy: "5 years",
    encryption_status: "encrypted",
    last_scanned: "2026-02-20T10:30:00Z",
  },
  {
    id: "7",
    org_id: "org-1",
    source_system: "PostgreSQL",
    table_or_collection: "addresses",
    field_name: "street_address",
    pii_type: "address",
    sensitivity: "high",
    purpose_ids: ["p1"],
    retention_policy: "5 years",
    encryption_status: "partial",
    last_scanned: "2026-02-18T09:15:00Z",
  },
  {
    id: "8",
    org_id: "org-1",
    source_system: "PostgreSQL",
    table_or_collection: "payments",
    field_name: "bank_account_number",
    pii_type: "financial",
    sensitivity: "critical",
    purpose_ids: ["p3"],
    retention_policy: "10 years",
    encryption_status: "encrypted",
    last_scanned: "2026-02-19T11:00:00Z",
  },
  {
    id: "9",
    org_id: "org-1",
    source_system: "MongoDB",
    table_or_collection: "user_sessions",
    field_name: "device_fingerprint",
    pii_type: "other",
    sensitivity: "low",
    purpose_ids: ["p4"],
    retention_policy: "90 days",
    encryption_status: "unencrypted",
    last_scanned: "2026-02-17T16:45:00Z",
  },
  {
    id: "10",
    org_id: "org-1",
    source_system: "MongoDB",
    table_or_collection: "support_tickets",
    field_name: "customer_email",
    pii_type: "email",
    sensitivity: "medium",
    purpose_ids: ["p5"],
    retention_policy: "3 years",
    encryption_status: "encrypted",
    last_scanned: "2026-02-20T08:00:00Z",
  },
  {
    id: "11",
    org_id: "org-1",
    source_system: "Redis",
    table_or_collection: "session_cache",
    field_name: "user_id",
    pii_type: "other",
    sensitivity: "low",
    purpose_ids: ["p4"],
    retention_policy: "24 hours",
    encryption_status: "encrypted",
    last_scanned: "2026-02-20T12:00:00Z",
  },
  {
    id: "12",
    org_id: "org-1",
    source_system: "S3",
    table_or_collection: "documents",
    field_name: "aadhaar_document",
    pii_type: "aadhaar",
    sensitivity: "critical",
    purpose_ids: ["p2"],
    retention_policy: "7 years",
    encryption_status: "encrypted",
    last_scanned: "2026-02-19T09:30:00Z",
  },
  {
    id: "13",
    org_id: "org-1",
    source_system: "S3",
    table_or_collection: "invoices",
    field_name: "billing_address",
    pii_type: "address",
    sensitivity: "medium",
    purpose_ids: ["p3"],
    retention_policy: "7 years",
    encryption_status: "partial",
    last_scanned: "2026-02-18T14:20:00Z",
  },
  {
    id: "14",
    org_id: "org-1",
    source_system: "BigQuery",
    table_or_collection: "analytics_events",
    field_name: "user_email",
    pii_type: "email",
    sensitivity: "medium",
    purpose_ids: ["p6"],
    retention_policy: "2 years",
    encryption_status: "encrypted",
    last_scanned: "2026-02-20T06:00:00Z",
  },
  {
    id: "15",
    org_id: "org-1",
    source_system: "BigQuery",
    table_or_collection: "analytics_events",
    field_name: "ip_address",
    pii_type: "other",
    sensitivity: "low",
    purpose_ids: ["p6"],
    retention_policy: "2 years",
    encryption_status: "unencrypted",
    last_scanned: "2026-02-20T06:00:00Z",
  },
  {
    id: "16",
    org_id: "org-1",
    source_system: "PostgreSQL",
    table_or_collection: "health_records",
    field_name: "medical_history",
    pii_type: "health",
    sensitivity: "critical",
    purpose_ids: ["p7"],
    retention_policy: "15 years",
    encryption_status: "encrypted",
    last_scanned: "2026-02-19T13:00:00Z",
  },
  {
    id: "17",
    org_id: "org-1",
    source_system: "MongoDB",
    table_or_collection: "biometric_logs",
    field_name: "face_template",
    pii_type: "biometric",
    sensitivity: "critical",
    purpose_ids: ["p8"],
    retention_policy: "1 year",
    encryption_status: "encrypted",
    last_scanned: "2026-02-18T10:00:00Z",
  },
];

const SOURCE_SYSTEMS = ["All", "PostgreSQL", "MongoDB", "Redis", "S3", "BigQuery"];
const PII_TYPES = [
  "All",
  "name",
  "email",
  "phone",
  "address",
  "aadhaar",
  "pan",
  "dob",
  "biometric",
  "financial",
  "health",
  "other",
];
const SENSITIVITY_LEVELS = ["All", "low", "medium", "high", "critical"];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function DataMappingPage() {
  const [sourceFilter, setSourceFilter] = useState("All");
  const [piiFilter, setPiiFilter] = useState("All");
  const [sensitivityFilter, setSensitivityFilter] = useState("All");

  const filteredEntries = useMemo(() => {
    return MOCK_DATA_MAP_ENTRIES.filter((entry) => {
      if (sourceFilter !== "All" && entry.source_system !== sourceFilter)
        return false;
      if (piiFilter !== "All" && entry.pii_type !== piiFilter) return false;
      if (sensitivityFilter !== "All" && entry.sensitivity !== sensitivityFilter)
        return false;
      return true;
    });
  }, [sourceFilter, piiFilter, sensitivityFilter]);

  const stats = useMemo(() => {
    const total = MOCK_DATA_MAP_ENTRIES.length;
    const critical = MOCK_DATA_MAP_ENTRIES.filter(
      (e) => e.sensitivity === "critical"
    ).length;
    const encrypted = MOCK_DATA_MAP_ENTRIES.filter(
      (e) => e.encryption_status === "encrypted"
    ).length;
    const sourceSystems = new Set(MOCK_DATA_MAP_ENTRIES.map((e) => e.source_system)).size;
    return { total, critical, encrypted, sourceSystems };
  }, []);

  const getSensitivityBadgeVariant = (
    sensitivity: DataMapEntry["sensitivity"]
  ): "default" | "success" | "warning" | "error" | "info" => {
    switch (sensitivity) {
      case "critical":
        return "error";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const getEncryptionBadgeVariant = (
    status: DataMapEntry["encryption_status"]
  ): "default" | "success" | "warning" | "error" | "info" => {
    switch (status) {
      case "encrypted":
        return "success";
      case "unencrypted":
        return "error";
      case "partial":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Data Mapping</h1>
        <div className="flex gap-2">
          <Button onClick={() => alert("Scan started")}>
            <Search className="mr-2 h-4 w-4" />
            Run New Scan
          </Button>
          <Button variant="outline" onClick={() => alert("Exporting report...")}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total PII Fields
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="rounded-lg bg-indigo-50 p-3">
                <Database className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Critical Fields
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.critical}
                </p>
              </div>
              <div className="rounded-lg bg-red-50 p-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Encrypted</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.encrypted}/{stats.total} (
                  {Math.round((stats.encrypted / stats.total) * 100)}%)
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-3">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Source Systems
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.sourceSystems}
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3">
                <CheckCircle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Source System
              </label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {SOURCE_SYSTEMS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                PII Type
              </label>
              <select
                value={piiFilter}
                onChange={(e) => setPiiFilter(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {PII_TYPES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Sensitivity Level
              </label>
              <select
                value={sensitivityFilter}
                onChange={(e) => setSensitivityFilter(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {SENSITIVITY_LEVELS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data Map Entries</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Source System
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Table/Collection
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Field Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  PII Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Sensitivity
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Encryption
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Retention Policy
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Last Scanned
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {entry.source_system}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {entry.table_or_collection}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {entry.field_name}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="info">{entry.pii_type}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getSensitivityBadgeVariant(entry.sensitivity)}>
                      {entry.sensitivity}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getEncryptionBadgeVariant(entry.encryption_status)}>
                      {entry.encryption_status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {entry.retention_policy}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(entry.last_scanned)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => alert(`View ${entry.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => alert(`Edit ${entry.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Data Flow Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data Flow Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-4 py-8">
            {/* User App */}
            <div className="flex flex-col items-center">
              <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 px-6 py-4 text-center">
                <p className="font-semibold text-indigo-900">User App</p>
                <p className="text-xs text-indigo-700">Frontend</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="h-0.5 w-8 bg-gray-300" />
              <div className="h-2 w-2 rotate-45 bg-gray-400" />
              <div className="h-0.5 w-8 bg-gray-300" />
            </div>

            {/* API Gateway */}
            <div className="flex flex-col items-center">
              <div className="rounded-xl border-2 border-amber-200 bg-amber-50 px-6 py-4 text-center">
                <p className="font-semibold text-amber-900">API Gateway</p>
                <p className="text-xs text-amber-700">REST/GraphQL</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <div className="h-0.5 w-4 bg-gray-300" />
              <div className="h-2 w-2 rotate-45 bg-gray-400" />
            </div>

            {/* Downstream systems - vertical layout on smaller screens */}
            <div className="flex flex-wrap items-center justify-center gap-6">
              <div className="flex flex-col items-center gap-2">
                <div className="h-0.5 w-4 bg-gray-300 sm:hidden" />
                <div className="rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-3 text-center">
                  <p className="font-semibold text-blue-900">PostgreSQL DB</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-center">
                  <p className="font-semibold text-red-900">Redis Cache</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-xl border-2 border-green-200 bg-green-50 px-4 py-3 text-center">
                  <p className="font-semibold text-green-900">S3 Storage</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-xl border-2 border-purple-200 bg-purple-50 px-4 py-3 text-center">
                  <p className="font-semibold text-purple-900">Analytics</p>
                  <p className="text-xs text-purple-700">BigQuery</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-6 text-xs text-gray-500">
            <span>User App → API Gateway → PostgreSQL DB</span>
            <span>→ Redis Cache</span>
            <span>→ S3 Storage</span>
            <span>→ Analytics (BigQuery)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
