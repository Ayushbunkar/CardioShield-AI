"""
CardioShield AI — Explainability Engine (SHAP Integration)
==========================================================
Provides SHAP-based feature explanations, plain-language summaries,
and feature importance charts for cardiovascular risk predictions.
"""

import os
import hashlib
import numpy as np
import pandas as pd
import joblib
from typing import Dict, List, Any, Optional

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

# Feature display name mapping
FEATURE_DISPLAY = {
    "gender": "Gender",
    "height": "Height",
    "weight": "Weight",
    "ap_hi": "Systolic BP",
    "ap_lo": "Diastolic BP",
    "cholesterol": "Cholesterol",
    "gluc": "Glucose",
    "smoke": "Smoking",
    "alco": "Alcohol",
    "active": "Physical Activity",
    "age_years": "Age",
    "bmi": "BMI",
    "pulse_pressure": "Pulse Pressure",
    "map": "Mean Arterial Pressure",
    "age_bp_interaction": "Age-BP Interaction",
    "age_chol_interaction": "Age-Cholesterol Interaction",
    "bmi_bp_interaction": "BMI-BP Interaction",
    "bmi_chol_interaction": "BMI-Cholesterol Interaction",
    "metabolic_risk": "Metabolic Risk Score",
    "lifestyle_risk": "Lifestyle Risk Score",
    "overall_risk": "Overall Risk Score",
    "bmi_category": "BMI Category",
    "bp_category": "BP Category",
    "age_category": "Age Category",
    "ap_hi_sq": "Systolic BP²",
    "bmi_sq": "BMI²",
    "age_years_sq": "Age²",
}

# Plain-language templates for risk factors
RISK_TEMPLATES = {
    "Age": {
        "high": "Age {value} is over 55, significantly increasing cardiovascular risk. Age is the strongest non-modifiable risk factor.",
        "moderate": "Age {value} places you in a moderate cardiovascular risk bracket. Early prevention is key.",
        "low": "Your age ({value}) is protective — younger individuals generally have lower cardiovascular risk.",
        "solutions": [
            "Get annual cardiac screenings after age 40",
            "Monitor blood pressure and cholesterol more frequently",
            "Maintain an active lifestyle to slow vascular aging",
            "Discuss aspirin therapy with your doctor if over 50",
            "Focus on controllable risk factors like diet, exercise, and smoking",
        ],
    },
    "Systolic BP": {
        "high": "Systolic BP {value} mmHg is elevated (>140). Hypertension is the single largest modifiable cardiovascular risk factor.",
        "moderate": "Systolic BP {value} mmHg is borderline elevated (120–139). Pre-hypertension requires lifestyle changes.",
        "low": "Your systolic blood pressure ({value} mmHg) is in a healthy range — excellent for heart health.",
        "solutions": [
            "Reduce daily sodium intake to below 2,300 mg (ideally 1,500 mg)",
            "Follow the DASH diet (rich in fruits, vegetables, whole grains, low-fat dairy)",
            "Exercise at least 30 minutes of moderate aerobic activity 5 days a week",
            "Limit alcohol to 1 drink/day (women) or 2/day (men)",
            "Manage stress through meditation, yoga, or deep breathing",
            "Take prescribed antihypertensive medications consistently",
            "Monitor blood pressure at home and keep a log for your doctor",
        ],
    },
    "Diastolic BP": {
        "high": "Diastolic BP {value} mmHg is elevated (>90). Combined with systolic readings, this indicates hypertension.",
        "moderate": "Diastolic BP {value} mmHg is borderline. Monitor regularly alongside systolic readings.",
        "low": "Your diastolic blood pressure ({value} mmHg) is healthy.",
        "solutions": [
            "Same interventions as systolic BP — reduce sodium, exercise, maintain healthy weight",
            "Avoid prolonged sitting; take movement breaks every 30–60 minutes",
            "Reduce caffeine intake if sensitive",
            "Ensure 7–8 hours of quality sleep nightly",
        ],
    },
    "BMI": {
        "high": "Your BMI ({value:.1f}) indicates obesity (≥30), which significantly increases cardiovascular risk through strain on the heart.",
        "moderate": "Your BMI ({value:.1f}) indicates overweight (25–29.9). Even modest weight loss can reduce risk.",
        "low": "Your BMI ({value:.1f}) is in a healthy range (18.5–24.9) — this is protective for heart health.",
        "solutions": [
            "Aim for gradual weight loss of 0.5–1 kg per week through caloric deficit",
            "Combine aerobic exercise (walking, cycling) with resistance training",
            "Increase fiber intake (25–30g/day) to improve satiety",
            "Reduce processed food, sugary drinks, and refined carbohydrates",
            "Consider consulting a dietitian for a personalized meal plan",
            "Track daily calorie intake using a food diary or app",
            "Even 5–10% body weight reduction significantly improves cardiac markers",
        ],
    },
    "Cholesterol": {
        "high": "High cholesterol (well above normal) significantly increases plaque buildup in arteries, raising heart attack and stroke risk.",
        "moderate": "Above-normal cholesterol levels are contributing to your cardiovascular risk. Intervention can lower it.",
        "low": "Cholesterol is within normal range — this is a positive factor protecting your arteries.",
        "solutions": [
            "Reduce saturated fat intake (red meat, full-fat dairy, fried foods) to <7% of daily calories",
            "Increase soluble fiber (oats, beans, lentils, fruits) — lowers LDL by 5–10%",
            "Add omega-3 fatty acids (salmon, walnuts, flaxseed) 2–3 times per week",
            "Exercise regularly — raises HDL (good) cholesterol",
            "Discuss statin therapy with your doctor if lifestyle changes are insufficient",
            "Get lipid panel blood tests every 4–6 years (annually if elevated)",
            "Avoid trans fats entirely (partially hydrogenated oils)",
        ],
    },
    "Glucose": {
        "high": "High glucose (well above normal) suggests diabetes or pre-diabetes, which doubles cardiovascular risk.",
        "moderate": "Above-normal glucose levels suggest pre-diabetes. Early intervention can prevent progression.",
        "low": "Glucose is within normal range — this is a positive factor for cardiovascular health.",
        "solutions": [
            "Monitor fasting blood glucose and HbA1c levels regularly",
            "Reduce refined carbohydrates and added sugars",
            "Choose complex carbs with low glycemic index (whole grains, legumes)",
            "Exercise helps muscles absorb glucose — aim for 150 min/week",
            "Maintain healthy body weight (strongly linked to insulin sensitivity)",
            "Discuss metformin or other medications with your doctor if pre-diabetic",
            "Eat smaller, balanced meals throughout the day instead of large meals",
        ],
    },
    "Smoking": {
        "high": "Smoking significantly increases cardiovascular risk by damaging blood vessels, raising BP, and promoting clot formation.",
        "moderate": "Smoking is contributing to your cardiovascular risk. Any reduction helps.",
        "low": "Non-smoking status is protective — your blood vessels and lungs are healthier.",
        "solutions": [
            "Quit smoking — cardiovascular risk drops by 50% within 1 year of quitting",
            "Use nicotine replacement therapy (patches, gum, lozenges) to manage withdrawal",
            "Consider prescription medications (varenicline/Chantix, bupropion/Wellbutrin)",
            "Join a smoking cessation support group or counseling program",
            "Avoid triggers — identify situations that prompt smoking and plan alternatives",
            "After 5 years smoke-free, stroke risk equals that of a non-smoker",
            "After 15 years, heart disease risk equals that of someone who never smoked",
        ],
    },
    "Alcohol": {
        "high": "Excessive alcohol intake raises blood pressure, causes cardiomyopathy, and increases stroke risk.",
        "moderate": "Alcohol consumption is contributing to your cardiovascular risk.",
        "low": "Your alcohol intake level is not a major risk factor currently.",
        "solutions": [
            "Limit alcohol to 1 standard drink/day (women) or 2/day (men)",
            "Avoid binge drinking (>4 drinks in one sitting)",
            "Track weekly alcohol consumption to stay within safe limits",
            "Choose alcohol-free days each week to reduce overall intake",
            "Seek professional help if you find it hard to cut back",
            "Stay hydrated — alternate alcoholic drinks with water",
        ],
    },
    "Physical Activity": {
        "high": "Physical inactivity increases cardiovascular risk by 30–50%. It weakens the heart muscle and promotes weight gain.",
        "moderate": "Insufficient physical activity is contributing to your cardiovascular risk.",
        "low": "Regular physical activity is protective — your heart is stronger and more efficient. Keep it up!",
        "solutions": [
            "Start with brisk walking 30 minutes/day, 5 days/week (150 min total)",
            "Gradually add resistance training 2 days/week for muscle and metabolic health",
            "Take stairs instead of elevators; walk during lunch breaks",
            "Reduce prolonged sitting — stand or stretch every 30 minutes",
            "Find an activity you enjoy (swimming, cycling, dancing) to stay consistent",
            "Even 10-minute activity bouts throughout the day provide cardiovascular benefits",
            "Use a fitness tracker to monitor daily steps (aim for 7,000–10,000)",
        ],
    },
    "Pulse Pressure": {
        "high": "Wide pulse pressure indicates arterial stiffness, a sign of aging blood vessels and increased cardiac workload.",
        "moderate": "Your pulse pressure is somewhat elevated. Monitor blood pressure regularly.",
        "low": "Your pulse pressure is normal, indicating healthy arterial elasticity.",
        "solutions": [
            "Control blood pressure with medication and lifestyle changes",
            "Reduce sodium intake to improve arterial flexibility",
            "Regular aerobic exercise improves arterial compliance",
            "Omega-3 fatty acids may help improve vascular function",
        ],
    },
    "Mean Arterial Pressure": {
        "high": "Elevated mean arterial pressure indicates sustained high blood pressure affecting organ perfusion.",
        "moderate": "Your mean arterial pressure is borderline. Blood pressure management is recommended.",
        "low": "Your mean arterial pressure is in a healthy range.",
        "solutions": [
            "Follow blood pressure management strategies (DASH diet, exercise, sodium reduction)",
            "Take prescribed medications consistently",
            "Regular monitoring helps track treatment effectiveness",
        ],
    },
    "Metabolic Risk Score": {
        "high": "A high metabolic risk score (combining cholesterol and glucose) indicates metabolic syndrome — a cluster of conditions increasing heart disease risk.",
        "moderate": "Your metabolic markers show some elevation. Lifestyle interventions can reverse this.",
        "low": "Your metabolic markers are well-controlled.",
        "solutions": [
            "Address each metabolic factor: cholesterol, glucose, blood pressure, waist circumference",
            "Mediterranean diet has proven benefits for metabolic syndrome",
            "Regular exercise improves insulin sensitivity and lipid profiles",
            "Maintain waist circumference below 102 cm (men) or 88 cm (women)",
            "Schedule regular metabolic panel blood work with your doctor",
        ],
    },
    "Lifestyle Risk Score": {
        "high": "Your combined lifestyle factors (smoking, alcohol, inactivity) significantly elevate cardiovascular risk. These are all modifiable.",
        "moderate": "Some lifestyle factors are contributing to your risk. Small changes compound into big improvements.",
        "low": "Your lifestyle choices are protecting your cardiovascular health — excellent!",
        "solutions": [
            "Prioritize the single biggest lifestyle risk factor and tackle it first",
            "Set realistic, incremental goals (e.g., reduce 1 cigarette/day per week)",
            "Build a support system — friends, family, or professional counsellors",
            "Track progress with a health journal or app for motivation",
        ],
    },
    "Overall Risk Score": {
        "high": "Your overall risk score combines metabolic and lifestyle factors, indicating significantly elevated cardiovascular risk.",
        "moderate": "Your overall risk score suggests room for improvement across multiple factors.",
        "low": "Your overall risk profile is favorable.",
        "solutions": [
            "Work with your healthcare provider on a comprehensive risk-reduction plan",
            "Address the top 2–3 modifiable factors first for maximum impact",
            "Regular follow-up appointments to monitor improvement",
        ],
    },
}


def _try_load_shap():
    """Try to import SHAP; return None if not available."""
    try:
        import shap
        return shap
    except ImportError:
        return None


# ── Cached SHAP Explainer (created once, reused) ────────────────────────────
_cached_explainer = None
_cached_explainer_model_id = None


def get_or_create_explainer(model, scaler=None, background_data=None):
    """Return a cached SHAP TreeExplainer, creating it only once."""
    global _cached_explainer, _cached_explainer_model_id
    model_id = id(model)
    if _cached_explainer is not None and _cached_explainer_model_id == model_id:
        return _cached_explainer
    shap = _try_load_shap()
    if shap is None:
        return None
    try:
        _cached_explainer = shap.TreeExplainer(model)
        _cached_explainer_model_id = model_id
        print("[SHAP] TreeExplainer cached")
        return _cached_explainer
    except Exception as e:
        print(f"[SHAP] Failed to create explainer: {e}")
        return None


# ─────────────────────────────────────────────────────────────────────────────
# SHAP-BASED EXPLANATION
# ─────────────────────────────────────────────────────────────────────────────


def compute_shap_explanation(
    model,
    X_instance: np.ndarray,
    feature_names: List[str],
    scaler=None,
    background_data: Optional[np.ndarray] = None,
) -> Dict[str, Any]:
    """
    Compute SHAP values for a single prediction.

    Returns dict with shap_values, base_value, feature_contributions.
    Falls back to model feature_importances_ if SHAP is unavailable.
    """
    X_scaled = scaler.transform(X_instance) if scaler is not None else X_instance

    if hasattr(model, 'get_booster') or hasattr(model, 'feature_importances_'):
        explainer = get_or_create_explainer(model, scaler, background_data)
        if explainer is not None:
            try:
                sv = explainer.shap_values(X_scaled)
                if isinstance(sv, list):
                    sv = sv[1]  # Class 1 (disease) SHAP values

                base_value = explainer.expected_value
                if isinstance(base_value, (list, np.ndarray)):
                    base_value = base_value[1] if len(base_value) > 1 else base_value[0]

                shap_values = sv[0] if sv.ndim > 1 else sv
                display_names = [FEATURE_DISPLAY.get(f, f) for f in feature_names]

                contributions = []
                for i, (fname, dname) in enumerate(zip(feature_names, display_names)):
                    val = float(shap_values[i])
                    contributions.append({
                        "feature": dname,
                        "feature_key": fname,
                        "shap_value": round(val, 4),
                        "direction": "increases" if val > 0 else "decreases",
                        "magnitude": round(abs(val), 4),
                    })

                contributions.sort(key=lambda x: x["magnitude"], reverse=True)

                return {
                    "method": "SHAP (TreeExplainer)",
                    "shap_values": {dname: round(float(v), 4) for dname, v in zip(display_names, shap_values)},
                    "base_value": round(float(base_value), 4),
                    "feature_contributions": contributions,
                    "top_3_risk_drivers": contributions[:3],
                }
            except Exception as e:
                print(f"[SHAP] shap_values failed: {e}, falling back to feature importance")

    # ── Fallback: Model feature importances ──
    return _importance_based_explanation(model, X_scaled, feature_names)


def _importance_based_explanation(
    model, X_scaled: np.ndarray, feature_names: List[str]
) -> Dict[str, Any]:
    """Fallback explanation using model feature importances + input values."""
    display_names = [FEATURE_DISPLAY.get(f, f) for f in feature_names]

    try:
        importances = model.feature_importances_
    except AttributeError:
        importances = np.ones(len(feature_names)) / len(feature_names)

    total = float(sum(importances))
    if total == 0:
        total = 1.0

    contributions = []
    for i, (fname, dname) in enumerate(zip(feature_names, display_names)):
        imp = float(importances[i]) / total
        val = float(X_scaled[0, i]) if X_scaled.ndim > 1 else float(X_scaled[i])
        # Use sign of scaled value to infer direction
        direction = "increases" if val > 0 else "decreases"
        contributions.append({
            "feature": dname,
            "feature_key": fname,
            "shap_value": round(imp * (1 if val > 0 else -1), 4),
            "direction": direction,
            "magnitude": round(imp, 4),
        })

    contributions.sort(key=lambda x: x["magnitude"], reverse=True)

    return {
        "method": "Feature Importance (fallback)",
        "shap_values": {dname: round(float(imp) / total, 4) for dname, imp in zip(display_names, importances)},
        "base_value": 0.5,
        "feature_contributions": contributions,
        "top_3_risk_drivers": contributions[:3],
    }


# ─────────────────────────────────────────────────────────────────────────────
# PLAIN-LANGUAGE EXPLANATION
# ─────────────────────────────────────────────────────────────────────────────


def generate_plain_explanation(
    patient_data: Dict,
    risk_score: float,
    contributions: List[Dict],
) -> Dict[str, Any]:
    """
    Generate a non-technical, patient-friendly explanation of the prediction.
    """
    risk_pct = round(risk_score * 100, 1)

    # Determine risk tier
    if risk_score < 0.25:
        tier = "low"
        tier_label = "Low"
        summary = f"Your estimated cardiovascular risk is {risk_pct}%, which falls in the low-risk category."
    elif risk_score < 0.50:
        tier = "moderate"
        tier_label = "Moderate"
        summary = f"Your estimated cardiovascular risk is {risk_pct}%, indicating moderate risk. Regular monitoring is advised."
    elif risk_score < 0.75:
        tier = "high"
        tier_label = "High"
        summary = f"Your estimated cardiovascular risk is {risk_pct}%, indicating high risk. Please consult a cardiologist."
    else:
        tier = "very_high"
        tier_label = "Very High"
        summary = f"Your estimated cardiovascular risk is {risk_pct}%, which is very high. Immediate medical consultation is strongly recommended."

    # Top risk drivers — plain language
    increasing = [c for c in contributions if c["direction"] == "increases"][:3]
    protective = [c for c in contributions if c["direction"] == "decreases"][:3]

    risk_explanations = []
    for c in increasing:
        feature = c["feature"]
        templates = RISK_TEMPLATES.get(feature, {})
        if c["magnitude"] > 0.1 and "high" in templates:
            text = templates["high"]
        elif "moderate" in templates:
            text = templates["moderate"]
        else:
            text = f"{feature} is contributing to increased cardiovascular risk."

        # Fill in values
        if feature == "Age":
            text = text.format(value=patient_data.get("age", "N/A"))
        elif feature == "Systolic BP":
            text = text.format(value=patient_data.get("ap_hi", "N/A"))
        elif feature == "BMI":
            h = float(patient_data.get("height", 170))
            w = float(patient_data.get("weight", 70))
            bmi = w / ((h / 100) ** 2) if h > 0 else 0
            text = text.format(value=bmi)
        solutions = templates.get("solutions", [f"Consult your doctor about managing {feature.lower()}."]) 
        risk_explanations.append({"feature": feature, "explanation": text, "solutions": solutions})

    protective_explanations = []
    for c in protective:
        feature = c["feature"]
        templates = RISK_TEMPLATES.get(feature, {})
        text = templates.get("low", f"{feature} is a protective factor reducing your cardiovascular risk.")
        if feature == "Age":
            text = text.format(value=patient_data.get("age", "N/A"))
        elif feature == "Systolic BP":
            text = text.format(value=patient_data.get("ap_hi", "N/A"))
        elif feature == "BMI":
            h = float(patient_data.get("height", 170))
            w = float(patient_data.get("weight", 70))
            bmi = w / ((h / 100) ** 2) if h > 0 else 0
            text = text.format(value=bmi)
        tips = templates.get("solutions", [f"Keep maintaining healthy {feature.lower()} levels."])
        protective_explanations.append({"feature": feature, "explanation": text, "tips": tips})

    # Compose non-technical narrative
    driver_names = [c["feature"] for c in increasing]
    if len(driver_names) >= 2:
        narrative = f"Elevated {driver_names[0].lower()} and {driver_names[1].lower()} significantly increased predicted cardiovascular risk."
        if len(driver_names) >= 3:
            narrative = f"Elevated {driver_names[0].lower()}, {driver_names[1].lower()}, and {driver_names[2].lower()} significantly increased predicted cardiovascular risk."
    elif len(driver_names) == 1:
        narrative = f"Elevated {driver_names[0].lower()} is the primary driver of increased predicted cardiovascular risk."
    else:
        narrative = "No major risk-increasing factors were identified."

    return {
        "summary": summary,
        "risk_percentage": risk_pct,
        "risk_tier": tier_label,
        "narrative": narrative,
        "risk_drivers": risk_explanations,
        "protective_factors": protective_explanations,
        "disclaimer": "This is a cardiovascular risk estimation tool. It is not a medical diagnosis. Always consult a qualified healthcare professional.",
        "escalation": (
            "HIGH RISK DETECTED: Consult a cardiologist immediately."
            if risk_score >= 0.70
            else None
        ),
    }


# ─────────────────────────────────────────────────────────────────────────────
# GLOBAL SHAP SUMMARY (for /explain-global endpoint)
# ─────────────────────────────────────────────────────────────────────────────

_cached_global_shap: Optional[Dict] = None


def compute_global_shap_summary(force: bool = False) -> Dict:
    """Compute global SHAP feature importance summary across dataset sample."""
    global _cached_global_shap
    if _cached_global_shap is not None and not force:
        return _cached_global_shap

    shap = _try_load_shap()

    model_path = os.path.join(MODELS_DIR, "xgboost_model.pkl")
    scaler_path = os.path.join(MODELS_DIR, "scaler.pkl")
    feature_names_path = os.path.join(MODELS_DIR, "feature_names.pkl")

    if not os.path.exists(model_path):
        return {"error": "Model not found"}

    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path) if os.path.exists(scaler_path) else None
    feature_names = joblib.load(feature_names_path) if os.path.exists(feature_names_path) else None

    # Load sample of data
    from train_models import clean_data, engineer_features
    csv_path = os.path.join(MODELS_DIR, "cardio_train.csv")
    if not os.path.exists(csv_path):
        return {"error": "Training data not found"}

    df = pd.read_csv(csv_path, sep=";")
    if "id" in df.columns:
        df = df.drop("id", axis=1)
    df = clean_data(df)
    df = engineer_features(df)
    X = df.drop("cardio", axis=1)
    if feature_names:
        X = X[feature_names]
    else:
        feature_names = list(X.columns)

    # Use a sample for speed
    sample = X.sample(n=min(500, len(X)), random_state=42)
    X_scaled = scaler.transform(sample) if scaler is not None else sample.values

    display_names = [FEATURE_DISPLAY.get(f, f) for f in feature_names]

    if shap is not None:
        try:
            explainer = shap.TreeExplainer(model)
            sv = explainer.shap_values(X_scaled)
            if isinstance(sv, list):
                sv = sv[1]

            mean_abs = np.abs(sv).mean(axis=0)
            total = mean_abs.sum()
            importance = {dname: round(float(v / total), 4) for dname, v in zip(display_names, mean_abs)}

            # Sort by importance
            importance = dict(sorted(importance.items(), key=lambda x: x[1], reverse=True))

            _cached_global_shap = {
                "method": "SHAP (TreeExplainer)",
                "sample_size": len(sample),
                "feature_importance": importance,
                "top_features": list(importance.keys())[:10],
            }
            return _cached_global_shap
        except Exception as e:
            print(f"[SHAP] Global summary failed: {e}")

    # Fallback
    try:
        imp = model.feature_importances_
        total = float(sum(imp))
        importance = {dname: round(float(v / total), 4) for dname, v in zip(display_names, imp)}
        importance = dict(sorted(importance.items(), key=lambda x: x[1], reverse=True))
    except Exception:
        importance = {dname: round(1.0 / len(display_names), 4) for dname in display_names}

    _cached_global_shap = {
        "method": "Feature Importance (fallback)",
        "sample_size": len(sample),
        "feature_importance": importance,
        "top_features": list(importance.keys())[:10],
    }
    return _cached_global_shap
