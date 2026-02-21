"""Keyword-based NLP classifier for grievance requests."""

import re
from typing import Literal

from app.models import ClassificationResult

# Keyword dictionaries for each request type
KEYWORD_MAP: dict[str, list[str]] = {
    "erasure": [
        "delete", "erase", "remove", "forget", "wipe", "destroy",
        "eliminate", "purge", "deletion", "deleted"
    ],
    "access": [
        "access", "view", "see", "know", "copy", "obtain", "provide",
        "share my data", "what data", "my information", "data you have"
    ],
    "correction": [
        "correct", "update", "fix", "change", "amend", "modify",
        "wrong", "inaccurate", "incorrect", "error", "mistake"
    ],
    "portability": [
        "transfer", "port", "move", "migrate", "export", "download",
        "portability", "take my data", "data export"
    ],
    "objection": [
        "object", "stop", "cease", "opt out", "unsubscribe", "withdraw",
        "revoke", "consent", "withdraw consent", "no longer want"
    ],
}

# Priority escalation keywords
CRITICAL_KEYWORDS = ["urgent", "immediately", "breach", "children", "child"]
HIGH_KEYWORDS = ["legal", "complaint", "DPB", "Data Protection Board", "sue", "court"]
LOW_KEYWORDS = ["general inquiry", "just asking", "curious", "information"]
MANUAL_REVIEW_KEYWORDS = ["legal action", "DPB", "Data Protection Board", "children", "child's data"]


class GrievanceClassifier:
    """Keyword-based classifier for DPDP grievance requests."""

    def classify(self, description: str, stated_type: str) -> ClassificationResult:
        """
        Classify a grievance based on description and stated type.

        Args:
            description: The grievance description text.
            stated_type: The request type stated by the data principal.

        Returns:
            ClassificationResult with classification details.
        """
        desc_lower = description.lower().strip()
        desc_words = set(re.findall(r"\b\w+\b", desc_lower))

        # Score each request type by keyword matches
        scores: dict[str, float] = {}
        for req_type, keywords in KEYWORD_MAP.items():
            matches = sum(1 for kw in keywords if kw in desc_lower or kw in desc_words)
            # Normalize by number of keywords (max possible matches)
            scores[req_type] = min(1.0, matches / max(1, len(keywords) // 2))

        # If stated type has matches, boost its score
        if stated_type in scores:
            scores[stated_type] = min(1.0, scores[stated_type] + 0.2)

        # Determine best match
        if scores:
            best_type = max(scores, key=scores.get)
            confidence = scores[best_type]
        else:
            best_type = stated_type
            confidence = 0.4  # Low confidence when no keywords match

        # Determine sub_category based on type
        sub_category = self._get_sub_category(best_type, desc_lower)

        # Determine priority
        priority = self._get_priority(desc_lower)

        # Determine estimated_complexity
        estimated_complexity = self._get_complexity(desc_lower, scores, best_type)

        # Determine requires_manual_review
        requires_manual_review = self._requires_manual_review(
            desc_lower, confidence
        )

        return ClassificationResult(
            request_type=best_type,
            confidence=round(confidence, 2),
            sub_category=sub_category,
            priority=priority,
            estimated_complexity=estimated_complexity,
            requires_manual_review=requires_manual_review,
        )

    def _get_sub_category(self, request_type: str, desc_lower: str) -> str:
        """Determine sub-category based on request type and description."""
        if request_type == "erasure":
            if "account" in desc_lower or "profile" in desc_lower:
                return "account_deletion"
            if "specific" in desc_lower or "certain" in desc_lower or "some" in desc_lower:
                return "partial_erasure"
            return "full_erasure"
        if request_type == "access":
            if "export" in desc_lower or "copy" in desc_lower:
                return "data_export_request"
            return "data_access_request"
        if request_type == "correction":
            if "name" in desc_lower or "address" in desc_lower:
                return "personal_details_correction"
            return "data_correction"
        if request_type == "portability":
            return "data_portability"
        if request_type == "objection":
            if "marketing" in desc_lower or "email" in desc_lower:
                return "marketing_objection"
            return "processing_objection"
        return "general"

    def _get_priority(self, desc_lower: str) -> Literal["low", "medium", "high", "critical"]:
        """Determine priority based on description keywords."""
        if any(kw in desc_lower for kw in CRITICAL_KEYWORDS):
            return "critical"
        if any(kw in desc_lower for kw in HIGH_KEYWORDS):
            return "high"
        if any(kw in desc_lower for kw in LOW_KEYWORDS):
            return "low"
        return "medium"

    def _get_complexity(
        self,
        desc_lower: str,
        scores: dict[str, float],
        best_type: str,
    ) -> Literal["simple", "moderate", "complex"]:
        """Determine estimated complexity."""
        # Multiple types detected
        types_above_threshold = [t for t, s in scores.items() if s > 0.3 and t != best_type]
        if len(types_above_threshold) >= 1:
            return "complex"

        # Legal terms mentioned
        if any(kw in desc_lower for kw in ["legal", "court", "lawyer", "DPB", "complaint"]):
            return "complex"

        # Clear single type with high confidence
        if scores.get(best_type, 0) >= 0.7:
            return "simple"

        return "moderate"

    def _requires_manual_review(self, desc_lower: str, confidence: float) -> bool:
        """Determine if manual review is required."""
        if confidence < 0.6:
            return True
        if any(kw in desc_lower for kw in MANUAL_REVIEW_KEYWORDS):
            return True
        return False
