"""Quick API test script."""

import requests, json

BASE = "http://localhost:5001"

# Health
r = requests.get(f"{BASE}/health")
print("Health:", r.json()["status"])

# Predict
data = {"input": [55, 2, 175, 85, 150, 95, 3, 2, 1, 0, 0]}
r = requests.post(f"{BASE}/predict", json=data)
result = r.json()
print(f"Predict response:", json.dumps(result, indent=2, default=str)[:500])

# Metrics
r = requests.get(f"{BASE}/metrics")
m = r.json()
print(
    f"Metrics: Acc={m['accuracy']:.4f} F1={m['f1']:.4f} Prec={m['precision']:.4f} Rec={m['recall']:.4f} AUC={m['auc']:.4f}"
)
print(f"Best: {m['best_model']}")

# Explain
data = {
    "patientData": {
        "age": 55,
        "gender": 2,
        "height": 175,
        "weight": 85,
        "ap_hi": 150,
        "ap_lo": 95,
        "cholesterol": 3,
        "gluc": 2,
        "smoke": 1,
        "alco": 0,
        "active": 0,
    }
}
r = requests.post(f"{BASE}/explain", json=data)
exp = r.json()
print(
    f"Explain: {len(exp.get('feature_impacts', []))} impacts, {len(exp.get('feature_importance', {}))} features"
)
print("Done!")
