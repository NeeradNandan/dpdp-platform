export type RequestType =
  | "access"
  | "correction"
  | "erasure"
  | "portability"
  | "objection";

export type Priority = "low" | "medium" | "high" | "critical";
export type Complexity = "simple" | "moderate" | "complex";

export interface GrievanceRequest {
  data_principal_email: string;
  request_type: RequestType;
  description: string;
  language?: string;
}

export interface ClassificationResult {
  request_type: RequestType;
  confidence: number;
  sub_category: string;
  priority: Priority;
  estimated_complexity: Complexity;
  requires_manual_review: boolean;
}

export interface AIResponse {
  case_id: string;
  response_text: string;
  language: string;
  suggested_actions: string[];
  sla_days: number;
  escalation_required: boolean;
  generated_at: string;
}

export interface GrievanceAnalytics {
  total_processed: number;
  by_type: Record<string, number>;
  avg_resolution_days: number;
  ai_accuracy: number;
  sla_compliance_rate: number;
}
