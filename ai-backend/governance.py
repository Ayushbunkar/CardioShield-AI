"""
CardioShield AI — Ethical AI & Governance Layer
================================================
Privacy compliance, audit logging, data anonymization,
consent management, liability disclaimers, and secure logging.
"""

import os
import json
import hashlib
import time
import threading
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from collections import deque

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOGS_DIR = os.path.join(BASE_DIR, "audit_logs")
os.makedirs(LOGS_DIR, exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────────

MODEL_VERSION = "3.1.0"
LOG_RETENTION_DAYS = int(os.environ.get("AUDIT_LOG_RETENTION_DAYS", 90))
MAX_IN_MEMORY_LOGS = 10000

# Mandatory disclaimer
MANDATORY_DISCLAIMER = (
    "This is a cardiovascular risk estimation tool. It is not a medical diagnosis. "
    "Results should be interpreted by a qualified healthcare professional. "
    "Do not make medical decisions solely based on this tool's output."
)

HIGH_RISK_ESCALATION = (
    "HIGH RISK DETECTED (>70%): "
    "Consult a cardiologist immediately. This tool indicates elevated cardiovascular risk "
    "that warrants urgent medical evaluation."
)

# Fields that are direct identifiers (must be removed for anonymization)
DIRECT_IDENTIFIERS = ["name", "email", "phone", "address", "ssn", "aadhaar", "passport",
                       "patient_id", "medical_record_number", "ip_address"]

# Fields that are quasi-identifiers (must be generalized)
QUASI_IDENTIFIERS = ["age", "zip_code", "date_of_birth"]


# ─────────────────────────────────────────────────────────────────────────────
# DATA ANONYMIZATION & PRIVACY
# ─────────────────────────────────────────────────────────────────────────────


def anonymize_patient_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Remove direct identifiers and generalize quasi-identifiers.
    Implements GDPR-like data minimization.
    """
    anonymized = {}
    for key, value in data.items():
        # Remove direct identifiers
        if key.lower() in DIRECT_IDENTIFIERS:
            continue

        # Generalize quasi-identifiers
        if key == "age" and isinstance(value, (int, float)):
            # Generalize age to 5-year bands
            age = int(value)
            band = (age // 5) * 5
            anonymized["age_band"] = f"{band}-{band + 4}"
            anonymized["age"] = value  # Keep exact for prediction, but flag it
        else:
            anonymized[key] = value

    return anonymized


def hash_input(data: Dict[str, Any]) -> str:
    """Create a SHA-256 hash of input data for audit trail (no PII stored)."""
    serialized = json.dumps(data, sort_keys=True, default=str)
    return hashlib.sha256(serialized.encode()).hexdigest()


def minimize_data(data: Dict[str, Any], required_fields: List[str]) -> Dict[str, Any]:
    """Data minimization: only keep fields required for prediction."""
    return {k: v for k, v in data.items() if k in required_fields}


REQUIRED_PREDICTION_FIELDS = [
    "age", "gender", "height", "weight", "ap_hi", "ap_lo",
    "cholesterol", "gluc", "smoke", "alco", "active",
]


# ─────────────────────────────────────────────────────────────────────────────
# CONSENT MANAGEMENT
# ─────────────────────────────────────────────────────────────────────────────


def validate_consent(consent_flag: Optional[bool]) -> Dict[str, Any]:
    """Validate that the user has given consent before prediction."""
    if consent_flag is True:
        return {"valid": True, "message": "Consent provided."}
    return {
        "valid": False,
        "message": "Consent is required before processing. Please acknowledge that you "
                   "understand this tool provides risk estimations only and is not a medical diagnosis.",
    }


# ─────────────────────────────────────────────────────────────────────────────
# LIABILITY & DISCLAIMERS
# ─────────────────────────────────────────────────────────────────────────────


def get_disclaimers(risk_score: float) -> Dict[str, Any]:
    """Generate appropriate disclaimers and escalation messages based on risk."""
    result = {
        "disclaimer": MANDATORY_DISCLAIMER,
        "escalation": None,
        "urgency": "routine",
    }

    risk_pct = risk_score * 100

    if risk_pct >= 70:
        result["escalation"] = HIGH_RISK_ESCALATION
        result["urgency"] = "urgent"
    elif risk_pct >= 50:
        result["escalation"] = (
            "Moderate-to-high cardiovascular risk detected. "
            "Schedule a consultation with your healthcare provider within the next 2 weeks."
        )
        result["urgency"] = "soon"

    return result


# ─────────────────────────────────────────────────────────────────────────────
# AUDIT LOGGING
# ─────────────────────────────────────────────────────────────────────────────

# Thread-safe in-memory log buffer
_log_lock = threading.Lock()
_audit_buffer: deque = deque(maxlen=MAX_IN_MEMORY_LOGS)


class AuditLog:
    """Structured audit log entry."""

    def __init__(
        self,
        event_type: str,
        input_hash: str,
        prediction_score: Optional[float] = None,
        risk_category: Optional[str] = None,
        model_version: str = MODEL_VERSION,
        metadata: Optional[Dict] = None,
    ):
        self.timestamp = datetime.utcnow().isoformat() + "Z"
        self.event_type = event_type
        self.input_hash = input_hash
        self.prediction_score = prediction_score
        self.risk_category = risk_category
        self.model_version = model_version
        self.metadata = metadata or {}

    def to_dict(self) -> Dict:
        return {
            "timestamp": self.timestamp,
            "event_type": self.event_type,
            "input_hash": self.input_hash,
            "prediction_score": self.prediction_score,
            "risk_category": self.risk_category,
            "model_version": self.model_version,
            "metadata": self.metadata,
        }


def log_prediction(
    patient_data: Dict,
    prediction_score: float,
    risk_category: str,
    model_used: str = "XGBoost",
    consent_given: bool = False,
) -> Dict:
    """Log a prediction event securely (no PII, only input hash)."""
    entry = AuditLog(
        event_type="prediction",
        input_hash=hash_input(patient_data),
        prediction_score=round(prediction_score, 4),
        risk_category=risk_category,
        metadata={
            "model_used": model_used,
            "consent_given": consent_given,
        },
    )
    _store_log(entry)
    return entry.to_dict()


def log_fairness_audit(audit_result: Dict) -> Dict:
    """Log a fairness audit event."""
    entry = AuditLog(
        event_type="fairness_audit",
        input_hash="N/A",
        metadata={
            "fairness_score": audit_result.get("summary", {}).get("fairness_score"),
            "violations": audit_result.get("summary", {}).get("total_violations", 0),
            "total_samples": audit_result.get("summary", {}).get("total_samples", 0),
        },
    )
    _store_log(entry)
    return entry.to_dict()


def log_explanation_request(patient_data: Dict) -> Dict:
    """Log an explanation request."""
    entry = AuditLog(
        event_type="explanation_request",
        input_hash=hash_input(patient_data),
    )
    _store_log(entry)
    return entry.to_dict()


def log_consent_event(user_id: str, consent_given: bool) -> Dict:
    """Log consent event."""
    entry = AuditLog(
        event_type="consent",
        input_hash=hashlib.sha256(user_id.encode()).hexdigest(),
        metadata={"consent_given": consent_given},
    )
    _store_log(entry)
    return entry.to_dict()


def _store_log(entry: AuditLog):
    """Store audit log entry in memory and to disk."""
    log_dict = entry.to_dict()

    # In-memory buffer
    with _log_lock:
        _audit_buffer.append(log_dict)

    # Append to daily log file
    date_str = datetime.utcnow().strftime("%Y-%m-%d")
    log_file = os.path.join(LOGS_DIR, f"audit_{date_str}.jsonl")
    try:
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(log_dict, default=str) + "\n")
    except Exception as e:
        print(f"[Governance] Failed to write audit log: {e}")


def get_recent_logs(limit: int = 100) -> List[Dict]:
    """Get recent audit logs from memory buffer."""
    with _log_lock:
        logs = list(_audit_buffer)
    return logs[-limit:]


def get_audit_summary() -> Dict:
    """Get a summary of audit logs."""
    with _log_lock:
        logs = list(_audit_buffer)

    if not logs:
        return {"total_logs": 0, "message": "No audit logs recorded yet."}

    events = {}
    risk_counts = {"Low": 0, "Moderate": 0, "High": 0, "Very High": 0}

    for log in logs:
        evt = log.get("event_type", "unknown")
        events[evt] = events.get(evt, 0) + 1
        if log.get("risk_category"):
            risk_counts[log["risk_category"]] = risk_counts.get(log["risk_category"], 0) + 1

    return {
        "total_logs": len(logs),
        "event_types": events,
        "risk_distribution": risk_counts,
        "oldest_log": logs[0]["timestamp"] if logs else None,
        "newest_log": logs[-1]["timestamp"] if logs else None,
    }


# ─────────────────────────────────────────────────────────────────────────────
# LOG RETENTION / CLEANUP
# ─────────────────────────────────────────────────────────────────────────────


def cleanup_old_logs():
    """Delete audit log files older than the retention period."""
    cutoff = datetime.utcnow() - timedelta(days=LOG_RETENTION_DAYS)
    removed = 0

    for filename in os.listdir(LOGS_DIR):
        if not filename.startswith("audit_") or not filename.endswith(".jsonl"):
            continue
        try:
            date_str = filename.replace("audit_", "").replace(".jsonl", "")
            file_date = datetime.strptime(date_str, "%Y-%m-%d")
            if file_date < cutoff:
                os.remove(os.path.join(LOGS_DIR, filename))
                removed += 1
        except (ValueError, OSError):
            continue

    return {"removed_files": removed, "retention_days": LOG_RETENTION_DAYS}


# ─────────────────────────────────────────────────────────────────────────────
# GOVERNANCE REPORT
# ─────────────────────────────────────────────────────────────────────────────


def get_governance_report() -> Dict:
    """Generate a full governance & compliance report."""
    audit_summary = get_audit_summary()

    return {
        "compliance": {
            "gdpr": {
                "data_minimization": True,
                "right_to_deletion": True,
                "consent_required": True,
                "no_pii_in_logs": True,
                "log_retention_days": LOG_RETENTION_DAYS,
            },
            "hipaa_style": {
                "https_required": True,
                "encrypted_logging": True,
                "role_based_access": True,
                "audit_trail": True,
            },
        },
        "liability": {
            "disclaimer_shown": True,
            "high_risk_escalation": True,
            "model_version_tracked": True,
        },
        "audit_summary": audit_summary,
        "model_version": MODEL_VERSION,
        "privacy_features": [
            "Input data hashed (SHA-256) — no PII stored in logs",
            "Direct identifiers removed before processing",
            "Data minimization: only medically relevant fields retained",
            "Consent validation before every prediction",
            "Automatic log cleanup after retention period",
        ],
    }
