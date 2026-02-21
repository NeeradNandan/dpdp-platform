"""API routes for the DPDP Grievance Bot."""

from typing import Literal, Union

from fastapi import APIRouter
from pydantic import BaseModel

from app.classifier import GrievanceClassifier
from app.models import (
    AIResponse,
    ClassificationResult,
    GrievanceAnalytics,
    GrievanceRequest,
)
from app.responder import GrievanceResponder, TEMPLATES

router = APIRouter(prefix="/api", tags=["grievance"])
classifier = GrievanceClassifier()
responder = GrievanceResponder()


@router.post("/classify", response_model=ClassificationResult)
def classify_grievance(request: GrievanceRequest) -> ClassificationResult:
    """Classify a grievance request and return the classification result."""
    return classifier.classify(
        description=request.description,
        stated_type=request.request_type,
    )


@router.post("/respond", response_model=AIResponse)
def generate_response(request: GrievanceRequest) -> AIResponse:
    """Classify the grievance and generate an AI response."""
    classification = classifier.classify(
        description=request.description,
        stated_type=request.request_type,
    )
    return responder.generate_response(classification=classification, request=request)


@router.post("/process")
def process_grievance(
    request: GrievanceRequest,
) -> dict[str, Union[ClassificationResult, AIResponse]]:
    """Full pipeline: classify and generate response, return both."""
    classification = classifier.classify(
        description=request.description,
        stated_type=request.request_type,
    )
    response = responder.generate_response(
        classification=classification,
        request=request,
    )
    return {
        "classification": classification,
        "response": response,
    }


@router.get("/analytics", response_model=GrievanceAnalytics)
def get_analytics() -> GrievanceAnalytics:
    """Return mock grievance analytics."""
    return GrievanceAnalytics(
        total_processed=1250,
        by_type={
            "access": 420,
            "correction": 310,
            "erasure": 280,
            "portability": 150,
            "objection": 90,
        },
        avg_resolution_days=32.5,
        ai_accuracy=0.87,
        sla_compliance_rate=0.92,
    )


@router.get("/templates")
def get_templates() -> dict[str, list[str]]:
    """Return the list of available response templates."""
    return {
        "available_types": list(TEMPLATES.keys()),
        "templates": list(TEMPLATES.keys()),
    }


class BulkClassifyItem(BaseModel):
    """Single item for bulk classification."""

    description: str
    stated_type: Literal[
        "access", "correction", "erasure", "portability", "objection"
    ] = "access"


class BulkClassifyRequest(BaseModel):
    """Request model for bulk classification."""

    items: list[BulkClassifyItem]


class BulkClassifyResponse(BaseModel):
    """Response model for bulk classification."""

    classifications: list[ClassificationResult]


@router.post("/bulk-classify", response_model=BulkClassifyResponse)
def bulk_classify(request: BulkClassifyRequest) -> BulkClassifyResponse:
    """Classify multiple grievance descriptions at once."""
    classifications = [
        classifier.classify(
            description=item.description,
            stated_type=item.stated_type,
        )
        for item in request.items
    ]
    return BulkClassifyResponse(classifications=classifications)
