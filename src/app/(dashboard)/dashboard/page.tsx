"use client";

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
import type { GrievanceTicket } from "@/types";

const MOCK_STATS = {
  total_consents: 12847,
  active_consents: 11203,
  open_grievances: 23,
  readiness_score: 78,
};

const MOCK_CONSENT_TREND = [
  { date: "Feb 15", count: 1820 },
  { date: "Feb 16", count: 1950 },
  { date: "Feb 17", count: 2100 },
  { date: "Feb 18", count: 1890 },
  { date: "Feb 19", count: 2200 },
  { date: "Feb 20", count: 1980 },
  { date: "Feb 21", count: 2107 },
];

const MOCK_GRIEVANCES: GrievanceTicket[] = [
  {
    id: "1",
    org_id: "org-1",
    case_id: "GRV-2025-001",
    data_principal_email: "user1@example.com",
    request_type: "access",
    status: "in_progress",
    priority: "high",
    description: "Request for data access",
    sla_deadline: "2025-03-15T23:59:59Z",
    created_at: "2025-02-18T10:00:00Z",
    updated_at: "2025-02-20T14:30:00Z",
  },
  {
    id: "2",
    org_id: "org-1",
    case_id: "GRV-2025-002",
    data_principal_email: "user2@example.com",
    request_type: "erasure",
    status: "open",
    priority: "critical",
    description: "Right to be forgotten request",
    sla_deadline: "2025-03-10T23:59:59Z",
    created_at: "2025-02-19T09:15:00Z",
    updated_at: "2025-02-19T09:15:00Z",
  },
  {
    id: "3",
    org_id: "org-1",
    case_id: "GRV-2025-003",
    data_principal_email: "user3@example.com",
    request_type: "correction",
    status: "awaiting_info",
    priority: "medium",
    description: "Data correction request",
    sla_deadline: "2025-03-22T23:59:59Z",
    created_at: "2025-02-20T11:00:00Z",
    updated_at: "2025-02-21T08:00:00Z",
  },
  {
    id: "4",
    org_id: "org-1",
    case_id: "GRV-2025-004",
    data_principal_email: "user4@example.com",
    request_type: "portability",
    status: "open",
    priority: "low",
    description: "Data portability request",
    sla_deadline: "2025-04-01T23:59:59Z",
    created_at: "2025-02-21T14:20:00Z",
    updated_at: "2025-02-21T14:20:00Z",
  },
  {
    id: "5",
    org_id: "org-1",
    case_id: "GRV-2025-005",
    data_principal_email: "user5@example.com",
    request_type: "objection",
    status: "escalated",
    priority: "high",
    description: "Objection to processing",
    sla_deadline: "2025-03-05T23:59:59Z",
    created_at: "2025-02-17T16:45:00Z",
    updated_at: "2025-02-20T12:00:00Z",
  },
];

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

export default function DashboardPage() {
  const maxTrendCount = Math.max(...MOCK_CONSENT_TREND.map((d) => d.count));
  const upcomingSla = MOCK_GRIEVANCES.filter((g) => {
    const days = getDaysUntilDeadline(g.sla_deadline);
    return days > 0 && days <= 30;
  }).sort(
    (a, b) =>
      new Date(a.sla_deadline).getTime() - new Date(b.sla_deadline).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Consents"
          value={MOCK_STATS.total_consents.toLocaleString()}
          icon={<FileText className="h-6 w-6" />}
        />
        <StatCard
          title="Active Consents"
          value={MOCK_STATS.active_consents.toLocaleString()}
          icon={<CheckCircle className="h-6 w-6" />}
        />
        <StatCard
          title="Open Grievances"
          value={MOCK_STATS.open_grievances}
          icon={<AlertCircle className="h-6 w-6" />}
        />
        <StatCard
          title="Readiness Score"
          value={`${MOCK_STATS.readiness_score}%`}
          icon={<Shield className="h-6 w-6" />}
        />
      </div>

      {/* Consent Trend */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-600" />
          <CardTitle>Consent Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-48">
            {MOCK_CONSENT_TREND.map(({ date, count }) => (
              <div key={date} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t bg-indigo-500 transition-all"
                  style={{
                    height: `${(count / maxTrendCount) * 100}%`,
                    minHeight: "8px",
                  }}
                />
                <span className="text-xs font-medium text-gray-600">{date}</span>
                <span className="text-xs text-gray-500">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Grievances */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Grievances</CardTitle>
          </CardHeader>
          <CardContent>
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
                  {MOCK_GRIEVANCES.map((g) => (
                    <tr key={g.id} className="border-b border-gray-100">
                      <td className="py-3 font-mono text-gray-900">{g.case_id}</td>
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
          </CardContent>
        </Card>

        {/* Upcoming SLA Deadlines */}
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
                        <p className="font-medium text-gray-900">{g.case_id}</p>
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
