"use client";

import { useState, useMemo, useEffect } from "react";
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
import { createClient } from "@/lib/supabase/client";
import { useOrg } from "@/hooks/use-org";

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
  const { loading: orgLoading } = useOrg();
  const [entries, setEntries] = useState<DataMapEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState("All");
  const [piiFilter, setPiiFilter] = useState("All");
  const [sensitivityFilter, setSensitivityFilter] = useState("All");

  useEffect(() => {
    if (orgLoading) return;
    const supabase = createClient();
    supabase
      .from("data_map_entries")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("Failed to fetch data map entries:", error);
        else setEntries(data ?? []);
        setLoading(false);
      });
  }, [orgLoading]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (sourceFilter !== "All" && entry.source_system !== sourceFilter)
        return false;
      if (piiFilter !== "All" && entry.pii_type !== piiFilter) return false;
      if (sensitivityFilter !== "All" && entry.sensitivity !== sensitivityFilter)
        return false;
      return true;
    });
  }, [entries, sourceFilter, piiFilter, sensitivityFilter]);

  const stats = useMemo(() => {
    const total = entries.length;
    const critical = entries.filter(
      (e) => e.sensitivity === "critical"
    ).length;
    const encrypted = entries.filter(
      (e) => e.encryption_status === "encrypted"
    ).length;
    const sourceSystems = new Set(entries.map((e) => e.source_system)).size;
    return { total, critical, encrypted, sourceSystems };
  }, [entries]);

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
                  {stats.total > 0 ? Math.round((stats.encrypted / stats.total) * 100) : 0}%)
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
              {(loading || orgLoading) ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-500">
                    Loading data map entries…
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-500">
                    No data map entries found.
                  </td>
                </tr>
              ) : filteredEntries.map((entry) => (
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
