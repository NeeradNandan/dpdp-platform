"""Pydantic models for the DPDP Grievance Bot API."""

from typing import Literal

from pydantic import BaseModel, Field


class GrievanceRequest(BaseModel):
    """Request model for grievance submission."""

    data_principal_email: str = Field(..., description="Email of the data principal")
    request_type: Literal[
        "access", "correction", "erasure", "portability", "objection"
    ] = Field(..., description="Stated type of the request")
    description: str = Field(..., description="Description of the grievance")
    language: str = Field(default="en", description="Preferred response language")


class ClassificationResult(BaseModel):
    """Result of AI classification of a grievance."""

    request_type: str = Field(..., description="Classified request type")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Classification confidence score")
    sub_category: str = Field(..., description="Sub-category of the request")
    priority: Literal["low", "medium", "high", "critical"] = Field(
        ..., description="Priority level for handling"
    )
    estimated_complexity: Literal["simple", "moderate", "complex"] = Field(
        ..., description="Estimated processing complexity"
    )
    requires_manual_review: bool = Field(
        ..., description="Whether manual review is required"
    )


class AIResponse(BaseModel):
    """AI-generated response to a grievance."""

    case_id: str = Field(..., description="Unique case identifier")
    response_text: str = Field(..., description="Generated response text")
    language: str = Field(..., description="Language of the response")
    suggested_actions: list[str] = Field(
        default_factory=list, description="Suggested actions for compliance team"
    )
    sla_days: int = Field(..., ge=1, description="SLA timeline in days")
    escalation_required: bool = Field(
        ..., description="Whether escalation is required"
    )
    generated_at: str = Field(..., description="ISO timestamp of generation")


class GrievanceAnalytics(BaseModel):
    """Analytics summary for grievance processing."""

    total_processed: int = Field(..., ge=0, description="Total grievances processed")
    by_type: dict[str, int] = Field(
        default_factory=dict, description="Count by request type"
    )
    avg_resolution_days: float = Field(
        ..., ge=0.0, description="Average resolution time in days"
    )
    ai_accuracy: float = Field(
        ..., ge=0.0, le=1.0, description="AI classification accuracy rate"
    )
    sla_compliance_rate: float = Field(
        ..., ge=0.0, le=1.0, description="SLA compliance percentage"
    )
