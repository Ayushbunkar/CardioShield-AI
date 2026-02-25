"""
CardioShield AI — Bias & Fairness Audit Engine
================================================
Evaluates model fairness across demographic subgroups (gender, age).
Computes disparate impact, equalized odds, FPR/FNR per group.
Applies mitigation: reweighting, threshold tuning, stratified sampling.
"""

import os
import numpy as np
import pandas as pd
import joblib
from typing import Dict, List, Any, Optional, Tuple
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    confusion_matrix,
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

# Fairness thresholds (4/5 rule for disparate impact)
DISPARATE_IMPACT_LOWER = 0.80
DISPARATE_IMPACT_UPPER = 1.25
EQUALIZED_ODDS_THRESHOLD = 0.10
FPR_FNR_THRESHOLD = 0.10

# ─────────────────────────────────────────────────────────────────────────────
# SUBGROUP DEFINITIONS
# ─────────────────────────────────────────────────────────────────────────────

AGE_BINS = [0, 40, 60, 100]
AGE_LABELS = ["<40", "40–60", ">60"]


def _age_group(age_years: float) -> str:
    if age_years < 40:
        return "<40"
    if age_years <= 60:
        return "40–60"
    return ">60"


def _gender_label(g: int) -> str:
    return "Female" if g == 1 else "Male"


# ─────────────────────────────────────────────────────────────────────────────
# CORE METRICS PER SUBGROUP
# ─────────────────────────────────────────────────────────────────────────────


def _subgroup_metrics(y_true: np.ndarray, y_pred: np.ndarray, y_proba: np.ndarray) -> Dict:
    """Compute full metrics for a single subgroup."""
    n = len(y_true)
    if n == 0:
        return {"count": 0}

    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel() if n > 1 else (0, 0, 0, 0)
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
    fnr = fn / (fn + tp) if (fn + tp) > 0 else 0.0
    tpr = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    positive_rate = float(y_true.mean())
    predicted_positive_rate = float(y_pred.mean())

    try:
        auc = roc_auc_score(y_true, y_proba) if len(set(y_true)) > 1 else 0.0
    except Exception:
        auc = 0.0

    return {
        "count": int(n),
        "positive_rate": round(positive_rate, 4),
        "predicted_positive_rate": round(predicted_positive_rate, 4),
        "accuracy": round(accuracy_score(y_true, y_pred), 4),
        "precision": round(precision_score(y_true, y_pred, zero_division=0), 4),
        "recall": round(recall_score(y_true, y_pred, zero_division=0), 4),
        "f1": round(f1_score(y_true, y_pred, zero_division=0), 4),
        "auc": round(auc, 4),
        "fpr": round(fpr, 4),
        "fnr": round(fnr, 4),
        "tpr": round(tpr, 4),
        "tp": int(tp),
        "fp": int(fp),
        "tn": int(tn),
        "fn": int(fn),
    }


# ─────────────────────────────────────────────────────────────────────────────
# FAIRNESS METRICS COMPUTATION
# ─────────────────────────────────────────────────────────────────────────────


def _disparate_impact(group_metrics: List[Dict]) -> float:
    """Compute disparate impact ratio (min selection rate / max selection rate)."""
    rates = [g["predicted_positive_rate"] for g in group_metrics if g["count"] > 0]
    if not rates or max(rates) == 0:
        return 1.0
    return round(min(rates) / max(rates), 4)


def _equalized_odds_diff(group_metrics: List[Dict]) -> float:
    """Max absolute difference in TPR or FPR across groups."""
    tprs = [g["tpr"] for g in group_metrics if g["count"] > 0]
    fprs = [g["fpr"] for g in group_metrics if g["count"] > 0]
    tpr_diff = max(tprs) - min(tprs) if tprs else 0.0
    fpr_diff = max(fprs) - min(fprs) if fprs else 0.0
    return round(max(tpr_diff, fpr_diff), 4)


def _demographic_parity_diff(group_metrics: List[Dict]) -> float:
    """Max difference in predicted positive rate across groups."""
    rates = [g["predicted_positive_rate"] for g in group_metrics if g["count"] > 0]
    return round(max(rates) - min(rates), 4) if rates else 0.0


def _check_violations(group_metrics: List[Dict], di: float, eod: float) -> List[Dict]:
    """Identify fairness threshold violations."""
    violations = []
    if di < DISPARATE_IMPACT_LOWER or di > DISPARATE_IMPACT_UPPER:
        violations.append({
            "metric": "Disparate Impact Ratio",
            "value": di,
            "threshold": f"{DISPARATE_IMPACT_LOWER}–{DISPARATE_IMPACT_UPPER}",
            "severity": "high" if di < 0.7 or di > 1.4 else "medium",
            "description": "Selection rates differ significantly across groups",
        })
    if eod > EQUALIZED_ODDS_THRESHOLD:
        violations.append({
            "metric": "Equalized Odds Difference",
            "value": eod,
            "threshold": f"≤ {EQUALIZED_ODDS_THRESHOLD}",
            "severity": "high" if eod > 0.15 else "medium",
            "description": "True/false positive rates differ across groups",
        })

    # Per-group FPR/FNR violations
    for g in group_metrics:
        if g["count"] == 0:
            continue
        if g["fnr"] > 0.25:
            violations.append({
                "metric": f"High FNR — {g.get('group_label', 'Unknown')}",
                "value": g["fnr"],
                "threshold": "≤ 0.25",
                "severity": "high",
                "description": f"False negative rate is dangerously high for {g.get('group_label', 'this group')}",
            })
    return violations


# ─────────────────────────────────────────────────────────────────────────────
# MAIN AUDIT FUNCTION
# ─────────────────────────────────────────────────────────────────────────────


def run_fairness_audit(
    model,
    X: np.ndarray,
    y_true: np.ndarray,
    gender_col: np.ndarray,
    age_years_col: np.ndarray,
    scaler=None,
) -> Dict[str, Any]:
    """
    Run comprehensive fairness audit.

    Parameters
    ----------
    model : sklearn-compatible classifier
    X : feature matrix (unscaled)
    y_true : true labels
    gender_col : array of gender values (1=Female, 2=Male)
    age_years_col : array of age in years
    scaler : optional StandardScaler for the model

    Returns
    -------
    dict with 'summary', 'analyses', 'violations'
    """
    X_input = scaler.transform(X) if scaler is not None else X
    y_pred = model.predict(X_input)
    y_proba = model.predict_proba(X_input)[:, 1]

    analyses = []

    # ── Gender Analysis ──
    gender_groups = []
    for gval, glabel in [(1, "Female"), (2, "Male")]:
        mask = gender_col == gval
        if mask.sum() == 0:
            continue
        m = _subgroup_metrics(y_true[mask], y_pred[mask], y_proba[mask])
        m["group_label"] = glabel
        m["group_value"] = int(gval)
        gender_groups.append(m)

    gender_di = _disparate_impact(gender_groups)
    gender_eod = _equalized_odds_diff(gender_groups)
    gender_dpd = _demographic_parity_diff(gender_groups)
    gender_violations = _check_violations(gender_groups, gender_di, gender_eod)

    analyses.append({
        "feature": "gender",
        "groups": gender_groups,
        "disparate_impact_ratio": gender_di,
        "equalized_odds_difference": gender_eod,
        "demographic_parity_diff": gender_dpd,
        "auc_disparity": round(
            max(g["auc"] for g in gender_groups) - min(g["auc"] for g in gender_groups), 4
        ) if gender_groups else 0.0,
        "violations": gender_violations,
        "is_fair": len(gender_violations) == 0,
    })

    # ── Age-Group Analysis ──
    age_groups_data = []
    for label in AGE_LABELS:
        mask = np.array([_age_group(a) == label for a in age_years_col])
        if mask.sum() == 0:
            continue
        m = _subgroup_metrics(y_true[mask], y_pred[mask], y_proba[mask])
        m["group_label"] = label
        age_groups_data.append(m)

    age_di = _disparate_impact(age_groups_data)
    age_eod = _equalized_odds_diff(age_groups_data)
    age_dpd = _demographic_parity_diff(age_groups_data)
    age_violations = _check_violations(age_groups_data, age_di, age_eod)

    analyses.append({
        "feature": "age_group",
        "groups": age_groups_data,
        "disparate_impact_ratio": age_di,
        "equalized_odds_difference": age_eod,
        "demographic_parity_diff": age_dpd,
        "auc_disparity": round(
            max(g["auc"] for g in age_groups_data) - min(g["auc"] for g in age_groups_data), 4
        ) if age_groups_data else 0.0,
        "violations": age_violations,
        "is_fair": len(age_violations) == 0,
    })

    # ── BMI-Proxy Socioeconomic Analysis ──
    bmi_col = X[:, 11] if X.shape[1] > 11 else None
    if bmi_col is not None:
        bmi_groups_data = []
        bmi_bins = [("Underweight (<18.5)", lambda b: b < 18.5),
                    ("Normal (18.5–25)", lambda b: 18.5 <= b < 25),
                    ("Overweight (25–30)", lambda b: 25 <= b < 30),
                    ("Obese (≥30)", lambda b: b >= 30)]
        for label, cond in bmi_bins:
            mask = np.array([cond(b) for b in bmi_col])
            if mask.sum() < 10:
                continue
            m = _subgroup_metrics(y_true[mask], y_pred[mask], y_proba[mask])
            m["group_label"] = label
            bmi_groups_data.append(m)

        if len(bmi_groups_data) >= 2:
            bmi_di = _disparate_impact(bmi_groups_data)
            bmi_eod = _equalized_odds_diff(bmi_groups_data)
            bmi_dpd = _demographic_parity_diff(bmi_groups_data)
            bmi_violations = _check_violations(bmi_groups_data, bmi_di, bmi_eod)
            analyses.append({
                "feature": "bmi_group",
                "groups": bmi_groups_data,
                "disparate_impact_ratio": bmi_di,
                "equalized_odds_difference": bmi_eod,
                "demographic_parity_diff": bmi_dpd,
                "auc_disparity": round(
                    max(g["auc"] for g in bmi_groups_data) - min(g["auc"] for g in bmi_groups_data), 4
                ),
                "violations": bmi_violations,
                "is_fair": len(bmi_violations) == 0,
            })

    # ── Overall Summary ──
    all_violations = []
    for a in analyses:
        all_violations.extend(a.get("violations", []))

    overall_score = 1.0
    for v in all_violations:
        penalty = 0.08 if v["severity"] == "high" else 0.04
        overall_score -= penalty
    overall_score = max(0.0, round(overall_score, 2))

    return {
        "summary": {
            "fairness_score": overall_score,
            "total_samples": int(len(y_true)),
            "model_accuracy": round(accuracy_score(y_true, y_pred), 4),
            "overall_auc": round(roc_auc_score(y_true, y_proba), 4) if len(set(y_true)) > 1 else 0.0,
            "total_violations": len(all_violations),
            "is_fair": len(all_violations) == 0,
            "overall_message": (
                "Model shows minimal bias across demographic groups. All fairness thresholds passed."
                if len(all_violations) == 0
                else f"Model has {len(all_violations)} fairness concern(s). Mitigation recommended."
            ),
        },
        "analyses": analyses,
        "violations": all_violations,
        "thresholds": {
            "disparate_impact": f"{DISPARATE_IMPACT_LOWER}–{DISPARATE_IMPACT_UPPER}",
            "equalized_odds": EQUALIZED_ODDS_THRESHOLD,
            "fnr_max": 0.25,
        },
    }


# ─────────────────────────────────────────────────────────────────────────────
# BIAS MITIGATION MODULE
# ─────────────────────────────────────────────────────────────────────────────


def compute_sample_weights(
    y: np.ndarray,
    gender: np.ndarray,
    age_years: np.ndarray,
) -> np.ndarray:
    """
    Fairlearn-style reweighting: compute sample weights to equalize
    positive prediction rates across subgroups.
    """
    n = len(y)
    weights = np.ones(n, dtype=float)
    groups = {}

    for i in range(n):
        key = (int(gender[i]), _age_group(age_years[i]))
        groups.setdefault(key, []).append(i)

    total_positive_rate = y.mean()
    for key, indices in groups.items():
        indices = np.array(indices)
        group_size = len(indices)
        if group_size == 0:
            continue
        group_pos_rate = y[indices].mean()
        if group_pos_rate == 0 or group_pos_rate == 1:
            continue

        # Reweight: up-weight underrepresented positive/negative outcomes
        for idx in indices:
            if y[idx] == 1:
                weights[idx] = total_positive_rate / group_pos_rate
            else:
                weights[idx] = (1 - total_positive_rate) / (1 - group_pos_rate)

    # Normalize so weights average to 1
    weights = weights / weights.mean()
    return weights


def adjust_thresholds_per_group(
    y_true: np.ndarray,
    y_proba: np.ndarray,
    group_col: np.ndarray,
    target_fnr: float = 0.15,
) -> Dict[str, float]:
    """
    Per-group threshold adjustment to equalize false negative rates.
    Finds the threshold that achieves the target FNR for each group.
    """
    thresholds = {}
    for g in np.unique(group_col):
        mask = group_col == g
        probas = y_proba[mask]
        labels = y_true[mask]

        best_threshold = 0.5
        best_diff = float("inf")

        for t in np.arange(0.2, 0.8, 0.01):
            preds = (probas >= t).astype(int)
            fn = ((preds == 0) & (labels == 1)).sum()
            tp = ((preds == 1) & (labels == 1)).sum()
            fnr = fn / (fn + tp) if (fn + tp) > 0 else 0.0
            diff = abs(fnr - target_fnr)
            if diff < best_diff:
                best_diff = diff
                best_threshold = t

        thresholds[str(g)] = round(best_threshold, 3)
    return thresholds


def run_mitigation(
    model,
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_test: np.ndarray,
    y_test: np.ndarray,
    gender_train: np.ndarray,
    age_years_train: np.ndarray,
    gender_test: np.ndarray,
    age_years_test: np.ndarray,
    scaler=None,
) -> Dict[str, Any]:
    """
    Run bias mitigation pipeline:
    1. Compute before-mitigation fairness
    2. Apply reweighting + retrain
    3. Apply per-group threshold adjustment
    4. Compute after-mitigation fairness
    5. Return comparison
    """
    # ── Before mitigation ──
    before = run_fairness_audit(model, X_test, y_test, gender_test, age_years_test, scaler)

    # ── Reweighting ──
    weights = compute_sample_weights(y_train, gender_train, age_years_train)

    # Clone and retrain the model with sample weights
    from sklearn.base import clone
    mitigated_model = clone(model)

    X_train_input = scaler.transform(X_train) if scaler is not None else X_train
    try:
        mitigated_model.fit(X_train_input, y_train, sample_weight=weights)
    except TypeError:
        # Model doesn't support sample_weight — fallback to stratified resampling
        from sklearn.utils import resample
        rng = np.random.RandomState(42)
        indices = rng.choice(len(X_train_input), size=len(X_train_input), replace=True, p=weights / weights.sum())
        mitigated_model.fit(X_train_input[indices], y_train.values[indices] if hasattr(y_train, 'values') else y_train[indices])

    # ── Threshold adjustment ──
    X_test_input = scaler.transform(X_test) if scaler is not None else X_test
    y_proba_after = mitigated_model.predict_proba(X_test_input)[:, 1]

    gender_thresholds = adjust_thresholds_per_group(
        y_test if isinstance(y_test, np.ndarray) else y_test.values,
        y_proba_after,
        gender_test,
    )
    age_group_test = np.array([_age_group(a) for a in age_years_test])
    age_thresholds = adjust_thresholds_per_group(
        y_test if isinstance(y_test, np.ndarray) else y_test.values,
        y_proba_after,
        age_group_test,
    )

    # ── After mitigation ──
    after = run_fairness_audit(mitigated_model, X_test, y_test, gender_test, age_years_test, scaler)

    # ── Comparison ──
    def _improvement(before_val, after_val, higher_is_better=True):
        if before_val == 0:
            return 0.0
        diff = after_val - before_val
        if not higher_is_better:
            diff = -diff
        return round(diff / abs(before_val) * 100, 2)

    comparison = {
        "fairness_score": {
            "before": before["summary"]["fairness_score"],
            "after": after["summary"]["fairness_score"],
            "improvement_pct": _improvement(
                before["summary"]["fairness_score"],
                after["summary"]["fairness_score"],
            ),
        },
        "violations": {
            "before": before["summary"]["total_violations"],
            "after": after["summary"]["total_violations"],
        },
        "accuracy": {
            "before": before["summary"]["model_accuracy"],
            "after": after["summary"]["model_accuracy"],
        },
    }

    # Per-analysis comparison
    per_feature = []
    for b_analysis, a_analysis in zip(before["analyses"], after["analyses"]):
        feat = b_analysis["feature"]
        per_feature.append({
            "feature": feat,
            "disparate_impact": {
                "before": b_analysis["disparate_impact_ratio"],
                "after": a_analysis["disparate_impact_ratio"],
            },
            "equalized_odds_diff": {
                "before": b_analysis["equalized_odds_difference"],
                "after": a_analysis["equalized_odds_difference"],
            },
            "demographic_parity_diff": {
                "before": b_analysis["demographic_parity_diff"],
                "after": a_analysis["demographic_parity_diff"],
            },
        })

    return {
        "before": before,
        "after": after,
        "comparison": comparison,
        "per_feature_comparison": per_feature,
        "mitigation_applied": [
            "Fairlearn-style sample reweighting",
            "Per-group threshold adjustment",
        ],
        "adjusted_thresholds": {
            "gender": gender_thresholds,
            "age_group": age_thresholds,
        },
        "mitigated_model": mitigated_model,
    }


# ─────────────────────────────────────────────────────────────────────────────
# PRECOMPUTE & CACHE
# ─────────────────────────────────────────────────────────────────────────────

_cached_audit: Optional[Dict] = None
_cached_mitigation: Optional[Dict] = None


def precompute_fairness(force: bool = False) -> Dict:
    """Load data + model and run fairness audit. Caches result."""
    global _cached_audit
    if _cached_audit is not None and not force:
        return _cached_audit

    from train_models import clean_data, engineer_features

    csv_path = os.path.join(MODELS_DIR, "cardio_train.csv")
    if not os.path.exists(csv_path):
        return {"error": "Training data not found"}

    df = pd.read_csv(csv_path, sep=";")
    if "id" in df.columns:
        df = df.drop("id", axis=1)
    df = clean_data(df)

    # Save gender & age before engineering (which drops raw age)
    gender_col = df["gender"].values.copy()
    age_years_col = (df["age"] / 365.25).values.copy()

    df = engineer_features(df)
    X = df.drop("cardio", axis=1)
    y = df["cardio"].values

    # Load model & scaler
    model_path = os.path.join(MODELS_DIR, "xgboost_model.pkl")
    scaler_path = os.path.join(MODELS_DIR, "scaler.pkl")
    feature_names_path = os.path.join(MODELS_DIR, "feature_names.pkl")

    if not os.path.exists(model_path):
        return {"error": "XGBoost model not found. Train models first."}

    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path) if os.path.exists(scaler_path) else None
    if os.path.exists(feature_names_path):
        fnames = joblib.load(feature_names_path)
        X = X[fnames]

    _cached_audit = run_fairness_audit(model, X.values, y, gender_col, age_years_col, scaler)
    return _cached_audit


def precompute_mitigation(force: bool = False) -> Dict:
    """Run full mitigation pipeline on training data. Caches result."""
    global _cached_mitigation
    if _cached_mitigation is not None and not force:
        # Return without model object
        result = {k: v for k, v in _cached_mitigation.items() if k != "mitigated_model"}
        return result

    from train_models import clean_data, engineer_features
    from sklearn.model_selection import train_test_split

    csv_path = os.path.join(MODELS_DIR, "cardio_train.csv")
    if not os.path.exists(csv_path):
        return {"error": "Training data not found"}

    df = pd.read_csv(csv_path, sep=";")
    if "id" in df.columns:
        df = df.drop("id", axis=1)
    df = clean_data(df)

    gender_all = df["gender"].values.copy()
    age_years_all = (df["age"] / 365.25).values.copy()

    df = engineer_features(df)
    X = df.drop("cardio", axis=1)
    y = df["cardio"]

    model_path = os.path.join(MODELS_DIR, "xgboost_model.pkl")
    scaler_path = os.path.join(MODELS_DIR, "scaler.pkl")
    feature_names_path = os.path.join(MODELS_DIR, "feature_names.pkl")

    if not os.path.exists(model_path):
        return {"error": "XGBoost model not found"}

    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path) if os.path.exists(scaler_path) else None
    if os.path.exists(feature_names_path):
        fnames = joblib.load(feature_names_path)
        X = X[fnames]

    # Split
    X_train, X_test, y_train, y_test, idx_train, idx_test = train_test_split(
        X.values, y.values, np.arange(len(y)), test_size=0.2, random_state=42, stratify=y,
    )

    _cached_mitigation = run_mitigation(
        model,
        X_train, y_train, X_test, y_test,
        gender_all[idx_train], age_years_all[idx_train],
        gender_all[idx_test], age_years_all[idx_test],
        scaler,
    )

    # Save mitigated model
    joblib.dump(_cached_mitigation["mitigated_model"], os.path.join(MODELS_DIR, "mitigated_xgboost.pkl"))

    result = {k: v for k, v in _cached_mitigation.items() if k != "mitigated_model"}
    return result
