export interface Organization {
  id: string;
  name: string;
  gstin: string;
  industry: string;
  size: "micro" | "small" | "medium" | "large";
  created_at: string;
  updated_at: string;
}

export interface ConsentRecord {
  id: string;
  org_id: string;
  data_principal_id: string;
  purpose_id: string;
  purpose_description: string;
  consent_status: "active" | "withdrawn" | "expired" | "pending";
  consent_method: "explicit_click" | "toggle" | "form_submission";
  session_id: string;
  ip_address?: string;
  user_agent?: string;
  granted_at: string;
  withdrawn_at?: string;
  expires_at?: string;
  metadata: Record<string, unknown>;
}

export interface ConsentPurpose {
  id: string;
  org_id: string;
  code: string;
  title: string;
  description: string;
  legal_basis: string;
  retention_period_days: number;
  is_mandatory: boolean;
  created_at: string;
}

export interface GrievanceTicket {
  id: string;
  org_id: string;
  case_id: string;
  data_principal_email: string;
  request_type:
    | "access"
    | "correction"
    | "erasure"
    | "portability"
    | "objection";
  status:
    | "open"
    | "in_progress"
    | "awaiting_info"
    | "resolved"
    | "escalated";
  priority: "low" | "medium" | "high" | "critical";
  description: string;
  ai_classification?: string;
  ai_response?: string;
  assigned_to?: string;
  sla_deadline: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DataMapEntry {
  id: string;
  org_id: string;
  source_system: string;
  table_or_collection: string;
  field_name: string;
  pii_type:
    | "name"
    | "email"
    | "phone"
    | "address"
    | "aadhaar"
    | "pan"
    | "dob"
    | "biometric"
    | "financial"
    | "health"
    | "other";
  sensitivity: "low" | "medium" | "high" | "critical";
  purpose_ids: string[];
  retention_policy: string;
  encryption_status: "encrypted" | "unencrypted" | "partial";
  last_scanned: string;
  notes?: string;
}

export interface ReadinessScore {
  overall: number;
  categories: {
    consent_management: number;
    data_mapping: number;
    grievance_redressal: number;
    breach_notification: number;
    security_safeguards: number;
    children_data: number;
  };
  recommendations: string[];
  generated_at: string;
}

export interface DashboardStats {
  total_consents: number;
  active_consents: number;
  withdrawn_consents: number;
  open_grievances: number;
  avg_resolution_days: number;
  pii_fields_mapped: number;
  readiness_score: number;
  consent_trend: { date: string; count: number }[];
  grievance_trend: { date: string; count: number }[];
}
