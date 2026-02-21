"use client";

import React, { useState, useMemo } from "react";
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
import { formatDate, generateCaseId } from "@/lib/utils";

const REQUEST_TYPES: GrievanceTicket["request_type"][] = [
  "access",
  "correction",
  "erasure",
  "portability",
  "objection",
];

const MOCK_GRIEVANCES: GrievanceTicket[] = [
  {
    id: "1",
    org_id: "org-1",
    case_id: "GRV-2026-A1B2C",
    data_principal_email: "rajesh.kumar@outlook.com",
    request_type: "access",
    status: "open",
    priority: "high",
    description:
      "I would like to request a copy of all my personal data that your organization holds. As per the DPDP Act 2023, I am entitled to access my data.",
    ai_classification: "access_request",
    sla_deadline: "2026-05-15T00:00:00Z",
    created_at: "2026-02-15T10:30:00Z",
    updated_at: "2026-02-15T10:30:00Z",
  },
  {
    id: "2",
    org_id: "org-1",
    case_id: "GRV-2026-D3E4F",
    data_principal_email: "priya.sharma@gmail.com",
    request_type: "correction",
    status: "in_progress",
    priority: "medium",
    description:
      "My phone number in your records is incorrect. Please update it to +91 9876543210. The current number 9876512340 is wrong.",
    ai_classification: "correction_request",
    assigned_to: "Amit Verma",
    sla_deadline: "2026-05-18T00:00:00Z",
    created_at: "2026-02-12T14:20:00Z",
    updated_at: "2026-02-20T09:00:00Z",
  },
  {
    id: "3",
    org_id: "org-1",
    case_id: "GRV-2026-G5H6I",
    data_principal_email: "sneha.patel@yahoo.co.in",
    request_type: "erasure",
    status: "awaiting_info",
    priority: "critical",
    description:
      "I want to delete all my personal data from your systems. Please process my erasure request as per the DPDP Act. I no longer wish to use your services.",
    ai_classification: "erasure_request",
    sla_deadline: "2026-05-10T00:00:00Z",
    created_at: "2026-02-10T09:15:00Z",
    updated_at: "2026-02-18T11:30:00Z",
  },
  {
    id: "4",
    org_id: "org-1",
    case_id: "GRV-2026-J7K8L",
    data_principal_email: "vikram.singh@rediffmail.com",
    request_type: "portability",
    status: "resolved",
    priority: "low",
    description:
      "I need to transfer my data to another service provider. Please provide my data in a machine-readable format (JSON or CSV).",
    ai_classification: "portability_request",
    assigned_to: "Neha Gupta",
    sla_deadline: "2026-05-08T00:00:00Z",
    resolved_at: "2026-02-18T16:00:00Z",
    created_at: "2026-02-08T11:00:00Z",
    updated_at: "2026-02-18T16:00:00Z",
  },
  {
    id: "5",
    org_id: "org-1",
    case_id: "GRV-2026-M9N0O",
    data_principal_email: "anita.desai@hotmail.com",
    request_type: "objection",
    status: "open",
    priority: "high",
    description:
      "I object to my data being used for marketing purposes. I did not consent to receiving promotional emails. Please stop all marketing communications.",
    ai_classification: "objection_request",
    sla_deadline: "2026-05-12T00:00:00Z",
    created_at: "2026-02-13T08:45:00Z",
    updated_at: "2026-02-13T08:45:00Z",
  },
  {
    id: "6",
    org_id: "org-1",
    case_id: "GRV-2026-P1Q2R",
    data_principal_email: "arun.menon@zoho.com",
    request_type: "access",
    status: "in_progress",
    priority: "medium",
    description:
      "Requesting access to my personal data including account details, transaction history, and any data shared with third parties.",
    ai_classification: "access_request",
    assigned_to: "Kavita Nair",
    sla_deadline: "2026-05-20T00:00:00Z",
    created_at: "2026-02-11T16:30:00Z",
    updated_at: "2026-02-19T10:15:00Z",
  },
  {
    id: "7",
    org_id: "org-1",
    case_id: "GRV-2026-S3T4U",
    data_principal_email: "meera.iyer@proton.me",
    request_type: "erasure",
    status: "open",
    priority: "critical",
    description:
      "Delete my account and all associated data. I want a complete erasure from your database. No retention of any kind.",
    ai_classification: "erasure_request",
    sla_deadline: "2026-05-11T00:00:00Z",
    created_at: "2026-02-10T13:00:00Z",
    updated_at: "2026-02-10T13:00:00Z",
  },
  {
    id: "8",
    org_id: "org-1",
    case_id: "GRV-2026-V5W6X",
    data_principal_email: "suresh.reddy@outlook.com",
    request_type: "correction",
    status: "resolved",
    priority: "low",
    description:
      "My address has changed. Please update: New address - 42 MG Road, Bangalore 560001. Old was Koramangala.",
    ai_classification: "correction_request",
    assigned_to: "Rahul Joshi",
    sla_deadline: "2026-05-22T00:00:00Z",
    resolved_at: "2026-02-17T14:30:00Z",
    created_at: "2026-02-09T10:00:00Z",
    updated_at: "2026-02-17T14:30:00Z",
  },
  {
    id: "9",
    org_id: "org-1",
    case_id: "GRV-2026-Y7Z8A",
    data_principal_email: "latha.venkatesh@gmail.com",
    request_type: "access",
    status: "awaiting_info",
    priority: "medium",
    description:
      "I need to view what data you have collected about me for KYC verification. Please provide details of documents stored.",
    ai_classification: "access_request",
    sla_deadline: "2026-05-19T00:00:00Z",
    created_at: "2026-02-12T09:00:00Z",
    updated_at: "2026-02-20T08:00:00Z",
  },
  {
    id: "10",
    org_id: "org-1",
    case_id: "GRV-2026-B9C0D",
    data_principal_email: "mohammed.rafiq@yahoo.com",
    request_type: "portability",
    status: "in_progress",
    priority: "high",
    description:
      "Transfer my financial transaction data to my new bank's app. Need CSV format with all transaction history from Jan 2024.",
    ai_classification: "portability_request",
    assigned_to: "Deepa Krishnan",
    sla_deadline: "2026-05-14T00:00:00Z",
    created_at: "2026-02-14T11:20:00Z",
    updated_at: "2026-02-20T12:00:00Z",
  },
  {
    id: "11",
    org_id: "org-1",
    case_id: "GRV-2026-E1F2G",
    data_principal_email: "kavitha.nair@outlook.com",
    request_type: "objection",
    status: "resolved",
    priority: "medium",
    description:
      "Object to profiling. I don't want my data used for automated decision-making or profiling for loan eligibility.",
    ai_classification: "objection_request",
    assigned_to: "Sandeep Rao",
    sla_deadline: "2026-05-16T00:00:00Z",
    resolved_at: "2026-02-19T15:00:00Z",
    created_at: "2026-02-11T14:00:00Z",
    updated_at: "2026-02-19T15:00:00Z",
  },
  {
    id: "12",
    org_id: "org-1",
    case_id: "GRV-2026-H3I4J",
    data_principal_email: "ramesh.pillai@rediffmail.com",
    request_type: "erasure",
    status: "in_progress",
    priority: "high",
    description:
      "Remove my data from your system. I am closing my account and want complete erasure as per my right under DPDP Act.",
    ai_classification: "erasure_request",
    assigned_to: "Anjali Mehta",
    sla_deadline: "2026-05-13T00:00:00Z",
    created_at: "2026-02-13T16:45:00Z",
    updated_at: "2026-02-20T09:30:00Z",
  },
  {
    id: "13",
    org_id: "org-1",
    case_id: "GRV-2026-K5L6M",
    data_principal_email: "divya.chandran@zoho.com",
    request_type: "correction",
    status: "open",
    priority: "low",
    description:
      "My date of birth is wrong in your records. Correct it to 15 March 1990. Currently showing as 15 March 1989.",
    ai_classification: "correction_request",
    sla_deadline: "2026-05-25T00:00:00Z",
    created_at: "2026-02-08T12:00:00Z",
    updated_at: "2026-02-08T12:00:00Z",
  },
  {
    id: "14",
    org_id: "org-1",
    case_id: "GRV-2026-N7O8P",
    data_principal_email: "ganesh.murthy@gmail.com",
    request_type: "access",
    status: "resolved",
    priority: "medium",
    description:
      "Requested copy of my data. Need it for tax filing purposes. Include all account statements and KYC documents.",
    ai_classification: "access_request",
    assigned_to: "Priya Sundaram",
    sla_deadline: "2026-05-05T00:00:00Z",
    resolved_at: "2026-02-16T11:00:00Z",
    created_at: "2026-02-06T10:00:00Z",
    updated_at: "2026-02-16T11:00:00Z",
  },
  {
    id: "15",
    org_id: "org-1",
    case_id: "GRV-2026-Q9R0S",
    data_principal_email: "indira.bose@hotmail.com",
    request_type: "portability",
    status: "awaiting_info",
    priority: "medium",
    description:
      "I want to port my health records to a new healthcare app. Please provide data in FHIR or JSON format.",
    ai_classification: "portability_request",
    sla_deadline: "2026-05-21T00:00:00Z",
    created_at: "2026-02-10T15:30:00Z",
    updated_at: "2026-02-19T14:00:00Z",
  },
  {
    id: "16",
    org_id: "org-1",
    case_id: "GRV-2026-T1U2V",
    data_principal_email: "balakrishnan.nair@proton.me",
    request_type: "objection",
    status: "in_progress",
    priority: "high",
    description:
      "I object to my data being shared with affiliates for cross-selling. Withdraw my consent for data sharing.",
    ai_classification: "objection_request",
    assigned_to: "Vikram Malhotra",
    sla_deadline: "2026-05-17T00:00:00Z",
    created_at: "2026-02-12T11:00:00Z",
    updated_at: "2026-02-20T10:00:00Z",
  },
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
  const [tickets, setTickets] = useState<GrievanceTicket[]>(MOCK_GRIEVANCES);

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

  const handleCreateGrievance = () => {
    if (!newGrievance.data_principal_email || !newGrievance.description) {
      alert("Please fill in email and description");
      return;
    }
    const caseId = generateCaseId();
    const created = new Date().toISOString();
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 90);

    const ticket: GrievanceTicket = {
      id: String(tickets.length + 1),
      org_id: "org-1",
      case_id: caseId,
      data_principal_email: newGrievance.data_principal_email,
      request_type: newGrievance.request_type,
      status: "open",
      priority: newGrievance.priority,
      description: newGrievance.description,
      sla_deadline: deadline.toISOString(),
      created_at: created,
      updated_at: created,
    };
    setTickets((prev) => [ticket, ...prev]);
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
              {filteredTickets.map((ticket) => (
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
