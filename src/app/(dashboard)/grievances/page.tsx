"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle,
  Sparkles,
  User,
  ChevronDown,
  ChevronUp,
  Send,
} from "lucide-react";
import type { GrievanceTicket } from "@/types";
import { formatDate, generateCaseId, calculateSLADeadline } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useOrg } from "@/hooks/use-org";

const REQUEST_TYPES: GrievanceTicket["request_type"][] = [
  "access",
  "correction",
  "erasure",
  "portability",
  "objection",
];

const TABS = ["All Tickets", "Open", "SLA At Risk", "Resolved"] as const;

const SLA_RISK_DAYS = 15;

function getAIResponse(requestType: GrievanceTicket["request_type"]): string {
  switch (requestType) {
    case "access":
      return "[MOCK] We have received your request to access your personal data. As per the DPDP Act 2023, we will provide you with a summary of all personal data we hold about you within 30 days. We will compile the data from our systems and send it to your registered email in a secure, readable format.";
    case "correction":
      return "[MOCK] We have received your request to correct your personal data. Our team will verify the information you have provided and update our records within 15 days. You will receive a confirmation once the correction has been made.";
    case "erasure":
      return "[MOCK] We have received your request to delete your personal data. As per the DPDP Act 2023, we will process your erasure request within 90 days. Please note that we may retain certain data as required by law (e.g., for tax compliance). You will receive a confirmation upon completion.";
    case "portability":
      return "[MOCK] We have received your data portability request. We will provide your personal data in a structured, machine-readable format (JSON/CSV) within 30 days. The data will be sent to your registered email address securely.";
    case "objection":
      return "[MOCK] We have received your objection to the processing of your personal data. We will review your request and cease the objected processing within 15 days, unless we have compelling legitimate grounds that override your interests. You will receive a written response explaining our decision.";
    default:
      return "[MOCK] We have received your grievance and will respond within the stipulated timeline under the DPDP Act 2023.";
  }
}

export default function GrievancesPage() {
  const { orgId, loading: orgLoading } = useOrg();
  const [tickets, setTickets] = useState<GrievanceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("All Tickets");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [aiResponseTicketId, setAiResponseTicketId] = useState<string | null>(
    null
  );
  const [isNewGrievanceOpen, setIsNewGrievanceOpen] = useState(false);
  const [newGrievance, setNewGrievance] = useState({
    data_principal_email: "",
    request_type: "access" as GrievanceTicket["request_type"],
    description: "",
    priority: "medium" as GrievanceTicket["priority"],
  });

  useEffect(() => {
    if (orgLoading) return;
    const supabase = createClient();
    supabase
      .from("grievance_tickets")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("Failed to fetch grievances:", error);
        else setTickets(data ?? []);
        setLoading(false);
      });
  }, [orgLoading]);

  const filteredTickets = useMemo(() => {
    let list = tickets;
    if (activeTab === "Open") {
      list = list.filter((t) => t.status === "open");
    } else if (activeTab === "SLA At Risk") {
      const now = new Date();
      const riskDate = new Date(now);
      riskDate.setDate(riskDate.getDate() + SLA_RISK_DAYS);
      list = list.filter((t) => {
        const deadline = new Date(t.sla_deadline);
        return deadline <= riskDate && t.status !== "resolved";
      });
    } else if (activeTab === "Resolved") {
      list = list.filter((t) => t.status === "resolved");
    }
    return list;
  }, [tickets, activeTab]);

  const stats = useMemo(() => {
    const open = tickets.filter((t) => t.status === "open").length;
    const inProgress = tickets.filter((t) => t.status === "in_progress").length;
    const awaitingInfo = tickets.filter(
      (t) => t.status === "awaiting_info"
    ).length;
    const resolved = tickets.filter((t) => t.status === "resolved").length;
    const resolvedTickets = tickets.filter((t) => t.resolved_at);
    const avgResolution =
      resolvedTickets.length > 0
        ? Math.round(
            resolvedTickets.reduce((acc, t) => {
              const created = new Date(t.created_at).getTime();
              const resolved = new Date(t.resolved_at!).getTime();
              return acc + (resolved - created) / (1000 * 60 * 60 * 24);
            }, 0) / resolvedTickets.length
          )
        : 0;
    return { open, inProgress, awaitingInfo, resolved, avgResolution };
  }, [tickets]);

  const getStatusBadgeVariant = (
    status: GrievanceTicket["status"]
  ): "default" | "success" | "warning" | "error" | "info" => {
    switch (status) {
      case "resolved":
        return "success";
      case "open":
        return "error";
      case "in_progress":
        return "info";
      case "awaiting_info":
        return "warning";
      case "escalated":
        return "error";
      default:
        return "default";
    }
  };

  const getPriorityBadgeVariant = (
    priority: GrievanceTicket["priority"]
  ): "default" | "success" | "warning" | "error" | "info" => {
    switch (priority) {
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

  const isSlaAtRisk = (deadline: string) => {
    const d = new Date(deadline);
    const now = new Date();
    const riskDate = new Date(now);
    riskDate.setDate(riskDate.getDate() + SLA_RISK_DAYS);
    return d <= riskDate;
  };

  const handleCreateGrievance = async () => {
    if (!newGrievance.data_principal_email || !newGrievance.description) {
      alert("Please fill in email and description");
      return;
    }
    const caseId = generateCaseId();
    const created = new Date().toISOString();
    const slaDeadline = calculateSLADeadline(created);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("grievance_tickets")
      .insert({
        org_id: orgId,
        case_id: caseId,
        data_principal_email: newGrievance.data_principal_email,
        request_type: newGrievance.request_type,
        description: newGrievance.description,
        status: "open",
        priority: newGrievance.priority,
        ai_classification: `${newGrievance.request_type}_request`,
        sla_deadline: slaDeadline,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create grievance:", error);
      alert("Failed to create grievance. Please try again.");
      return;
    }

    setTickets((prev) => [data, ...prev]);
    setNewGrievance({
      data_principal_email: "",
      request_type: "access",
      description: "",
      priority: "medium",
    });
    setIsNewGrievanceOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Grievance Redressal
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => alert("AI Auto-Classify running...")}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            AI Auto-Classify
          </Button>
          <Button onClick={() => setIsNewGrievanceOpen(true)}>
            <MessageSquare className="mr-2 h-4 w-4" />
            New Grievance
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Open</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.open}
                </p>
              </div>
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.inProgress}
                </p>
              </div>
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Awaiting Info
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.awaitingInfo}
                </p>
              </div>
              <User className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Resolved</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.resolved}
                </p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Avg Resolution
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.avgResolution} days
                </p>
              </div>
              <Clock className="h-6 w-6 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Ticket Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Grievance Tickets</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Case ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Data Principal Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Request Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  AI Classification
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  SLA Deadline
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Created At
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
                    Loading grievance tickets…
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-500">
                    No grievance tickets found.
                  </td>
                </tr>
              ) : filteredTickets.map((ticket) => (
                <React.Fragment key={ticket.id}>
                  <tr
                    key={ticket.id}
                    onClick={() =>
                      setExpandedId(expandedId === ticket.id ? null : ticket.id)
                    }
                    className="cursor-pointer border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {ticket.case_id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {ticket.data_principal_email}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{ticket.request_type}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusBadgeVariant(ticket.status)}>
                        {ticket.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {ticket.ai_classification || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          isSlaAtRisk(ticket.sla_deadline) &&
                          ticket.status !== "resolved"
                            ? "text-red-600 font-medium"
                            : "text-gray-700"
                        }
                      >
                        {formatDate(ticket.sla_deadline)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(ticket.created_at)}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setAiResponseTicketId(
                              aiResponseTicketId === ticket.id ? null : ticket.id
                            )
                          }
                        >
                          <Sparkles className="mr-1 h-4 w-4" />
                          Generate AI Response
                        </Button>
                        {expandedId === ticket.id ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedId === ticket.id && (
                    <tr key={`${ticket.id}-expanded`}>
                      <td colSpan={10} className="bg-gray-50 px-4 py-4">
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Full Description
                            </p>
                            <p className="mt-1 text-sm text-gray-600">
                              {ticket.description}
                            </p>
                          </div>
                          {ticket.assigned_to && (
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Assigned To
                              </p>
                              <p className="mt-1 text-sm text-gray-600">
                                {ticket.assigned_to}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Timeline
                            </p>
                            <ul className="mt-1 space-y-1 text-sm text-gray-600">
                              <li>
                                Created: {formatDate(ticket.created_at)}
                              </li>
                              <li>Last Updated: {formatDate(ticket.updated_at)}</li>
                              {ticket.resolved_at && (
                                <li>
                                  Resolved: {formatDate(ticket.resolved_at)}
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* AI Response Panel */}
      {aiResponseTicketId && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Suggested Response
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAiResponseTicketId(null)}
            >
              Close
            </Button>
          </CardHeader>
          <CardContent>
            {(() => {
              const ticket = tickets.find((t) => t.id === aiResponseTicketId);
              if (!ticket) return null;
              const response = getAIResponse(ticket.request_type);
              return (
                <div className="space-y-4">
                  <p className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                    {response}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm">
                      <Send className="mr-2 h-4 w-4" />
                      Use & Send
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit Response
                    </Button>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* New Grievance Modal */}
      <Modal
        isOpen={isNewGrievanceOpen}
        onClose={() => setIsNewGrievanceOpen(false)}
        title="New Grievance"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Data Principal Email"
            type="email"
            placeholder="user@example.com"
            value={newGrievance.data_principal_email}
            onChange={(e) =>
              setNewGrievance((p) => ({
                ...p,
                data_principal_email: e.target.value,
              }))
            }
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Request Type
            </label>
            <select
              value={newGrievance.request_type}
              onChange={(e) =>
                setNewGrievance((p) => ({
                  ...p,
                  request_type: e.target.value as GrievanceTicket["request_type"],
                }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {REQUEST_TYPES.map((rt) => (
                <option key={rt} value={rt}>
                  {rt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={newGrievance.description}
              onChange={(e) =>
                setNewGrievance((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Describe the grievance in detail..."
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              value={newGrievance.priority}
              onChange={(e) =>
                setNewGrievance((p) => ({
                  ...p,
                  priority: e.target.value as GrievanceTicket["priority"],
                }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsNewGrievanceOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateGrievance}>
              <Send className="mr-2 h-4 w-4" />
              Create Grievance
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
