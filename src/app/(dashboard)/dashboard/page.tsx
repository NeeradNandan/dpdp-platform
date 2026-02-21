"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Shield,
  Clock,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useOrg } from "@/hooks/use-org";
import type { GrievanceTicket } from "@/types";

const SLA_DEADLINE_DAYS = 90;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusBadgeVariant(
  status: GrievanceTicket["status"]
): "default" | "success" | "warning" | "error" | "info" {
  switch (status) {
    case "resolved":
      return "success";
    case "open":
    case "awaiting_info":
      return "warning";
    case "escalated":
      return "error";
    case "in_progress":
      return "info";
    default:
      return "default";
  }
}

function getPriorityBadgeVariant(
  priority: GrievanceTicket["priority"]
): "default" | "success" | "warning" | "error" | "info" {
  switch (priority) {
    case "critical":
      return "error";
    case "high":
      return "warning";
    case "medium":
      return "info";
    default:
      return "default";
  }
}

function getDaysUntilDeadline(deadline: string): number {
  const now = new Date();
  const d = new Date(deadline);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

interface Stats {
  total_consents: number;
  active_consents: number;
  open_grievances: number;
  readiness_score: number;
}

interface TrendPoint {
  date: string;
  count: number;
}

export default function DashboardPage() {
  const { orgId, loading: orgLoading } = useOrg();
  const [stats, setStats] = useState<Stats>({
    total_consents: 0,
    active_consents: 0,
    open_grievances: 0,
    readiness_score: 0,
  });
  const [consentTrend, setConsentTrend] = useState<TrendPoint[]>([]);
  const [grievances, setGrievances] = useState<GrievanceTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orgLoading || !orgId) return;

    const supabase = createClient();

    async function fetchDashboard() {
      const [consentsRes, activeRes, grievancesRes, trendRes] =
        await Promise.all([
          supabase
            .from("consent_records")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("consent_records")
            .select("*", { count: "exact", head: true })
            .eq("consent_status", "active"),
          supabase
            .from("grievance_tickets")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("consent_records")
            .select("granted_at")
            .gte(
              "granted_at",
              new Date(Date.now() - 7 * 86400000).toISOString()
            )
            .order("granted_at", { ascending: true }),
        ]);

      const openGrievances = (grievancesRes.data ?? []).filter(
        (g) => g.status !== "resolved"
      ).length;

      const totalConsents = consentsRes.count ?? 0;
      const activeConsents = activeRes.count ?? 0;
      const score =
        totalConsents > 0
          ? Math.min(100, Math.round((activeConsents / totalConsents) * 100))
          : 0;

      setStats({
        total_consents: totalConsents,
        active_consents: activeConsents,
        open_grievances: openGrievances,
        readiness_score: score,
      });

      setGrievances((grievancesRes.data as GrievanceTicket[]) ?? []);

      const trendData = trendRes.data ?? [];
      const grouped = new Map<string, number>();
      for (const r of trendData) {
        const day = new Date(r.granted_at).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
        });
        grouped.set(day, (grouped.get(day) ?? 0) + 1);
      }
      setConsentTrend(
        Array.from(grouped.entries()).map(([date, count]) => ({ date, count }))
      );

      setLoading(false);
    }

    fetchDashboard();
  }, [orgId, orgLoading]);

  if (orgLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  const maxTrendCount = Math.max(1, ...consentTrend.map((d) => d.count));
  const upcomingSla = grievances
    .filter((g) => {
      const days = getDaysUntilDeadline(g.sla_deadline);
      return days > 0 && days <= 30 && g.status !== "resolved";
    })
    .sort(
      (a, b) =>
        new Date(a.sla_deadline).getTime() -
        new Date(b.sla_deadline).getTime()
    );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Consents"
          value={stats.total_consents.toLocaleString()}
          icon={<FileText className="h-6 w-6" />}
        />
        <StatCard
          title="Active Consents"
          value={stats.active_consents.toLocaleString()}
          icon={<CheckCircle className="h-6 w-6" />}
        />
        <StatCard
          title="Open Grievances"
          value={stats.open_grievances}
          icon={<AlertCircle className="h-6 w-6" />}
        />
        <StatCard
          title="Readiness Score"
          value={`${stats.readiness_score}%`}
          icon={<Shield className="h-6 w-6" />}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-600" />
          <CardTitle>Consent Trend (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {consentTrend.length > 0 ? (
            <div className="flex items-end gap-2 h-48">
              {consentTrend.map(({ date, count }) => (
                <div
                  key={date}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div
                    className="w-full rounded-t bg-indigo-500 transition-all"
                    style={{
                      height: `${(count / maxTrendCount) * 100}%`,
                      minHeight: "8px",
                    }}
                  />
                  <span className="text-xs font-medium text-gray-600">
                    {date}
                  </span>
                  <span className="text-xs text-gray-500">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 py-8 text-center">
              No consent data yet. Consents will appear here once recorded.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Grievances</CardTitle>
          </CardHeader>
          <CardContent>
            {grievances.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-600">
                      <th className="pb-3 font-medium">Case ID</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Priority</th>
                      <th className="pb-3 font-medium">Created</th>
                      <th className="pb-3 font-medium">SLA Deadline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grievances.map((g) => (
                      <tr key={g.id} className="border-b border-gray-100">
                        <td className="py-3 font-mono text-gray-900">
                          {g.case_id}
                        </td>
                        <td className="py-3 capitalize text-gray-700">
                          {g.request_type.replace("_", " ")}
                        </td>
                        <td className="py-3">
                          <Badge variant={getStatusBadgeVariant(g.status)}>
                            {g.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Badge variant={getPriorityBadgeVariant(g.priority)}>
                            {g.priority}
                          </Badge>
                        </td>
                        <td className="py-3 text-gray-600">
                          {formatDate(g.created_at)}
                        </td>
                        <td className="py-3 text-gray-600">
                          {formatDate(g.sla_deadline)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4 text-center">
                No grievance tickets yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            <CardTitle>Upcoming SLA Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-500">
              Grievances nearing their {SLA_DEADLINE_DAYS}-day deadline
            </p>
            {upcomingSla.length > 0 ? (
              <ul className="space-y-3">
                {upcomingSla.map((g) => {
                  const days = getDaysUntilDeadline(g.sla_deadline);
                  return (
                    <li
                      key={g.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {g.case_id}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {g.request_type.replace("_", " ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">
                          {formatDate(g.sla_deadline)}
                        </p>
                        <p
                          className={`text-xs font-medium ${
                            days <= 7 ? "text-red-600" : "text-amber-600"
                          }`}
                        >
                          {days} days left
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                No grievances approaching SLA deadline.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
