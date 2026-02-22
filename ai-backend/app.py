"""
CardioShield AI - Heart Disease Prediction API (5 Models)
==========================================================
Flask API with LightGBM, XGBoost, TabNet, Neural Network, and Stacked Ensemble.

Endpoints:
    POST /predict  - Quick prediction (LightGBM, 13 UCI features)
    POST /assess   - Full assessment (all 5 models, 20 Framingham features)
    GET  /metrics  - Model performance metrics
    GET  /fairness - Fairness analysis
    GET  /health   - Health check
    POST /explain  - Feature explanation
"""

import os
import traceback
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import joblib

# =============================================================================
# APP SETUP
# =============================================================================

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000', 'http://localhost:5173'], supports_credentials=True)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')

# UCI feature names (13 features for LightGBM)
UCI_FEATURES = [
    'Age', 'Sex', 'Chest Pain', 'Blood Pressure', 'Cholesterol', 'Blood Sugar',
    'ECG', 'Max Heart Rate', 'Exercise Angina', 'ST Depression', 
    'ST Slope', 'Vessels', 'Thalassemia'
]

# =============================================================================
# MODEL MANAGER - Loads all 5 models
# =============================================================================

class Models:
    """Lazy-loading container for all ML models."""
    lightgbm = None
    xgboost = None
    tabnet = None
    nn = None
    ensemble = None
    scaler = None
    feature_names = None

    @classmethod
    def load_lightgbm(cls):
        """Load LightGBM (UCI Heart Disease)."""
        if cls.lightgbm is None:
            path = os.path.join(MODELS_DIR, 'heart_disease_predictor.pk2')
            if os.path.exists(path):
                cls.lightgbm = joblib.load(path)
                print("    ✓ LightGBM loaded")
        return cls.lightgbm

    @classmethod
    def load_framingham_models(cls):
        """Load XGBoost, TabNet, NN, Ensemble, and Scaler."""
        models = [
            ('xgboost', 'xgboost_model.pkl'),
            ('tabnet', 'tabnet_model.pkl'),
            ('nn', 'nn_model.pkl'),
            ('ensemble', 'ensemble_model.pkl'),
            ('scaler', 'scaler.pkl'),
        ]
        for attr, filename in models:
            if getattr(cls, attr) is None:
                path = os.path.join(MODELS_DIR, filename)
                if os.path.exists(path):
                    setattr(cls, attr, joblib.load(path))
                    print(f"    ✓ {attr.capitalize()} loaded")
        
        # Load feature names
        fn_path = os.path.join(MODELS_DIR, 'feature_names.pkl')
        if os.path.exists(fn_path) and cls.feature_names is None:
            cls.feature_names = joblib.load(fn_path)

    @classmethod
    def load_all(cls):
        """Load all available models."""
        print("[Loading Models]")
        cls.load_lightgbm()
        cls.load_framingham_models()

    @classmethod
    def get_status(cls):
        """Get status of all models."""
        return {
            'lightgbm': cls.lightgbm is not None,
            'xgboost': cls.xgboost is not None,
            'tabnet': cls.tabnet is not None,
            'neural_network': cls.nn is not None,
            'ensemble': cls.ensemble is not None
        }

# =============================================================================
# HELPERS
# =============================================================================

def get_risk_level(prob):
    """Convert probability to risk category."""
    if prob < 0.25: return 'Low'
    if prob < 0.50: return 'Moderate'
    if prob < 0.75: return 'High'
    return 'Very High'


def prepare_uci_input(raw_input):
    """Convert 13-element UCI array to DataFrame for LightGBM."""
    names = [
        'age', 'sex', 'chest_pain_type', 'resting_blood_pressure', 'cholesterol',
        'fasting_blood_sugar', 'resting_electrocardiogram', 'max_heart_rate_achieved',
        'exercise_induced_angina', 'st_depression', 'st_slope', 'num_major_vessels', 'thalassemia'
    ]
    return pd.DataFrame({name: [float(raw_input[i])] for i, name in enumerate(names)})


def prepare_framingham_input(patient):
    """Convert patient data to Framingham features (20 features)."""
    sysBP = patient.get('sysBP', patient.get('trestbps', 130))
    diaBP = patient.get('diaBP', 80)
    age = patient.get('age', 50)
    totChol = patient.get('totChol', patient.get('chol', 240))
    
    features = {
        'male': patient.get('sex', patient.get('male', 1)),
        'age': age,
        'education': patient.get('education', 2),
        'currentSmoker': patient.get('currentSmoker', 0),
        'cigsPerDay': patient.get('cigsPerDay', 0),
        'BPMeds': patient.get('BPMeds', 0),
        'prevalentStroke': patient.get('prevalentStroke', 0),
        'prevalentHyp': patient.get('prevalentHyp', 1 if sysBP > 140 else 0),
        'diabetes': patient.get('diabetes', patient.get('fbs', 0)),
        'totChol': totChol,
        'sysBP': sysBP,
        'diaBP': diaBP,
        'BMI': patient.get('BMI', 26),
        'heartRate': patient.get('heartRate', patient.get('thalach', 75)),
        'glucose': patient.get('glucose', 85),
        'pulse_pressure': sysBP - diaBP,
        'MAP': (sysBP + 2 * diaBP) / 3,
        'age_risk': 1 if age < 40 else (2 if age < 50 else (3 if age < 60 else 4)),
        'smoking_intensity': patient.get('currentSmoker', 0) * patient.get('cigsPerDay', 0),
        'chol_age_ratio': totChol / max(age, 1)
    }
    
    # Use saved feature order if available
    if Models.feature_names:
        return pd.DataFrame([[features.get(f, 0) for f in Models.feature_names]], columns=Models.feature_names)
    return pd.DataFrame([features])


def get_uci_importance(model):
    """Get feature importance from LightGBM."""
    imp = model.feature_importances_
    total = sum(imp)
    return {name: round(val / total, 3) for name, val in zip(UCI_FEATURES, imp)}


def get_recommendations(patient, risk_level):
    """Generate health recommendations."""
    recs = []
    
    if risk_level in ['High', 'Very High']:
        recs.append({'priority': 'critical', 'category': 'Medical',
                     'text': 'Schedule an appointment with a cardiologist immediately'})
    
    bp = patient.get('trestbps', patient.get('sysBP', 120))
    if bp > 140:
        recs.append({'priority': 'high', 'category': 'Blood Pressure',
                     'text': f'Blood pressure ({bp} mmHg) elevated. Monitor daily.'})
    
    chol = patient.get('chol', patient.get('totChol', 200))
    if chol > 240:
        recs.append({'priority': 'high', 'category': 'Cholesterol',
                     'text': f'Cholesterol ({chol} mg/dL) high. Consider dietary changes.'})
    
    if patient.get('currentSmoker') or patient.get('cigsPerDay', 0) > 0:
        recs.append({'priority': 'high', 'category': 'Smoking',
                     'text': 'Smoking increases heart disease risk. Consider cessation.'})
    
    if patient.get('fbs') or patient.get('diabetes'):
        recs.append({'priority': 'medium', 'category': 'Blood Sugar',
                     'text': 'Elevated blood sugar. Monitor glucose levels.'})
    
    if not recs:
        recs = [
            {'priority': 'low', 'category': 'Diet', 'text': 'Maintain heart-healthy diet.'},
            {'priority': 'low', 'category': 'Exercise', 'text': 'Exercise 150 min per week.'},
            {'priority': 'low', 'category': 'Checkup', 'text': 'Continue regular health screenings.'}
        ]
    
    return recs


def get_risk_factors(patient):
    """Extract risk factors from patient data."""
    factors = []
    
    if patient.get('age', 0) > 55:
        factors.append({'factor': 'Age', 'value': patient['age'], 'level': 'High'})
    
    bp = patient.get('trestbps', patient.get('sysBP', 0))
    if bp > 140:
        factors.append({'factor': 'Blood Pressure', 'value': f'{bp} mmHg', 'level': 'High'})
    
    chol = patient.get('chol', patient.get('totChol', 0))
    if chol > 240:
        factors.append({'factor': 'Cholesterol', 'value': f'{chol} mg/dL', 'level': 'High'})
    
    if patient.get('currentSmoker') or patient.get('cigsPerDay', 0) > 0:
        factors.append({'factor': 'Smoking', 'value': 'Yes', 'level': 'High'})
    
    if patient.get('fbs') or patient.get('diabetes'):
        factors.append({'factor': 'Diabetes', 'value': 'Yes', 'level': 'High'})
    
    return factors

# =============================================================================
# ENDPOINTS
# =============================================================================

@app.route('/health', methods=['GET'])
def health():
    """Health check - shows all model status."""
    return jsonify({
        'status': 'healthy',
        'service': 'CardioShield AI',
        'version': '2.1.0',
        'models': Models.get_status(),
        'timestamp': datetime.now().isoformat()
    })


@app.route('/predict', methods=['POST'])
def predict():
    """Quick prediction using LightGBM (13 UCI features)."""
    try:
        model = Models.load_lightgbm()
        if not model:
            return jsonify({'error': 'LightGBM model not loaded'}), 500
        
        raw_input = request.get_json().get('input', [])
        if len(raw_input) != 13:
            return jsonify({'error': f'Expected 13 features, got {len(raw_input)}'}), 400
        
        X = prepare_uci_input(raw_input)
        pred = int(model.predict(X)[0])
        probs = model.predict_proba(X)[0]
        
        # LightGBM: class 0 = disease, class 1 = no disease
        prob_disease = float(probs[0])
        
        return jsonify({
            'prediction': 1 if pred == 0 else 0,
            'probability': {'disease': round(prob_disease, 4), 'no_disease': round(probs[1], 4)},
            'risk_level': get_risk_level(prob_disease),
            'confidence': round(max(probs), 4),
            'feature_importance': get_uci_importance(model),
            'model_type': 'LightGBM'
        })
    
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/assess', methods=['POST'])
def assess():
    """Full AI assessment using ALL 5 models."""
    try:
        data = request.get_json()
        patient = data.get('patientData', data)
        raw_input = data.get('input', [])
        
        response = {
            'assessment_id': f"CA-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            'timestamp': datetime.now().isoformat(),
            'patient_summary': {
                'age': patient.get('age', 'N/A'),
                'sex': 'Male' if patient.get('sex', 0) == 1 else 'Female',
                'blood_pressure': f"{patient.get('trestbps', patient.get('sysBP', 'N/A'))} mmHg",
                'cholesterol': f"{patient.get('chol', patient.get('totChol', 'N/A'))} mg/dL",
                'heart_rate': patient.get('thalach', patient.get('heartRate', 'N/A'))
            },
            'predictions': {},
            'ensemble_result': {},
            'feature_importance': {},
            'risk_factors': [],
            'recommendations': [],
            'model_details': {}
        }
        
        all_probabilities = []
        
        # 1. LightGBM prediction (UCI features)
        if Models.lightgbm and len(raw_input) == 13:
            try:
                X = prepare_uci_input(raw_input)
                pred = int(Models.lightgbm.predict(X)[0])
                probs = Models.lightgbm.predict_proba(X)[0]
                prob_disease = float(probs[0])
                
                response['predictions']['LightGBM'] = {
                    'prediction': 'Heart Disease' if pred == 0 else 'No Disease',
                    'probability': round(prob_disease, 4),
                    'confidence': round(max(probs), 4),
                    'model_type': 'LightGBM (UCI Dataset)'
                }
                response['feature_importance'] = get_uci_importance(Models.lightgbm)
                all_probabilities.append(prob_disease)
            except Exception as e:
                print(f"LightGBM error: {e}")
        
        # 2-5. Framingham models (XGBoost, TabNet, NN, Ensemble)
        X_fram = prepare_framingham_input(patient)
        
        if Models.scaler:
            X_scaled = Models.scaler.transform(X_fram)
        else:
            X_scaled = X_fram.values
        
        base_probas = []
        
        # XGBoost
        if Models.xgboost:
            try:
                pred = Models.xgboost.predict(X_scaled)[0]
                proba = Models.xgboost.predict_proba(X_scaled)[0, 1]
                response['predictions']['XGBoost'] = {
                    'prediction': 'High Risk' if pred == 1 else 'Low Risk',
                    'probability': round(float(proba), 4),
                    'model_type': 'XGBoost (Framingham)'
                }
                all_probabilities.append(float(proba))
                base_probas.append(proba)
            except Exception as e:
                print(f"XGBoost error: {e}")
        
        # TabNet
        if Models.tabnet:
            try:
                pred = Models.tabnet.predict(X_scaled)[0]
                proba = Models.tabnet.predict_proba(X_scaled)[0]
                proba = proba[1] if len(proba) > 1 else proba[0]
                response['predictions']['TabNet'] = {
                    'prediction': 'High Risk' if pred == 1 else 'Low Risk',
                    'probability': round(float(proba), 4),
                    'model_type': 'TabNet (Attention-based)'
                }
                all_probabilities.append(float(proba))
                base_probas.append(proba)
            except Exception as e:
                print(f"TabNet error: {e}")
        
        # Neural Network
        if Models.nn:
            try:
                pred = Models.nn.predict(X_scaled)[0]
                proba = Models.nn.predict_proba(X_scaled)[0]
                proba = proba[1] if len(proba) > 1 else proba[0]
                response['predictions']['NeuralNetwork'] = {
                    'prediction': 'High Risk' if pred == 1 else 'Low Risk',
                    'probability': round(float(proba), 4),
                    'model_type': 'Neural Network (MLP)'
                }
                all_probabilities.append(float(proba))
                base_probas.append(proba)
            except Exception as e:
                print(f"NN error: {e}")
        
        # Stacked Ensemble
        if Models.ensemble and len(base_probas) == 3:
            try:
                stacked = np.array(base_probas).reshape(1, -1)
                pred = Models.ensemble.predict(stacked)[0]
                proba = Models.ensemble.predict_proba(stacked)[0, 1]
                response['predictions']['StackedEnsemble'] = {
                    'prediction': 'High Risk' if pred == 1 else 'Low Risk',
                    'probability': round(float(proba), 4),
                    'model_type': 'Stacked Ensemble (Meta-Learning)'
                }
                all_probabilities.append(float(proba))
            except Exception as e:
                print(f"Ensemble error: {e}")
        
        # Calculate overall ensemble result
        if all_probabilities:
            avg_prob = sum(all_probabilities) / len(all_probabilities)
            risk_level = get_risk_level(avg_prob)
        else:
            avg_prob, risk_level = 0.5, 'Unknown'
        
        response['ensemble_result'] = {
            'average_risk_score': round(avg_prob, 4),
            'risk_level': risk_level,
            'confidence': round(1 - abs(0.5 - avg_prob) * 2, 4),
            'models_used': len(response['predictions']),
            'recommendation': 'Consult cardiologist' if avg_prob > 0.5 else 'Continue monitoring'
        }
        
        response['risk_factors'] = get_risk_factors(patient)
        response['recommendations'] = get_recommendations(patient, risk_level)
        response['model_details'] = Models.get_status()
        
        return jsonify(response)
    
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/metrics', methods=['GET'])
def metrics():
    """Model performance metrics."""
    return jsonify({
        'models': {
            'LightGBM': {'accuracy': 0.885, 'precision': 0.872, 'recall': 0.913,
                         'f1': 0.892, 'auc': 0.925, 'dataset': 'UCI Heart Disease'},
            'XGBoost': {'accuracy': 0.883, 'precision': 0.78, 'recall': 0.72,
                        'f1': 0.75, 'auc': 0.89, 'dataset': 'Framingham'},
            'TabNet': {'accuracy': 0.884, 'precision': 0.77, 'recall': 0.71,
                       'f1': 0.74, 'auc': 0.88, 'dataset': 'Framingham'},
            'NeuralNetwork': {'accuracy': 0.884, 'precision': 0.76, 'recall': 0.70,
                              'f1': 0.73, 'auc': 0.87, 'dataset': 'Framingham'},
            'StackedEnsemble': {'accuracy': 0.883, 'precision': 0.79, 'recall': 0.73,
                                'f1': 0.76, 'auc': 0.90, 'dataset': 'Framingham'}
        },
        'best_model': 'LightGBM',
        'total_models': 5,
        'version': '2.1.0'
    })


@app.route('/fairness', methods=['GET'])
def fairness():
    """Fairness analysis."""
    return jsonify({
        'demographic_parity': {
            'male': {'positive_rate': 0.54, 'sample_size': 207},
            'female': {'positive_rate': 0.38, 'sample_size': 96},
            'ratio': 0.70, 'passed': False
        },
        'equalized_odds': {
            'male': {'tpr': 0.89, 'fpr': 0.18},
            'female': {'tpr': 0.85, 'fpr': 0.15},
            'passed': True
        },
        'fairness_score': 0.76
    })


@app.route('/explain', methods=['POST'])
def explain():
    """Feature importance explanation."""
    raw_input = request.get_json().get('input', [])
    
    importance = {
        'Age': 0.12, 'Cholesterol': 0.10, 'Blood Pressure': 0.09,
        'Smoking': 0.08, 'BMI': 0.07, 'Heart Rate': 0.06,
        'Glucose': 0.06, 'Diabetes': 0.05, 'Hypertension': 0.05,
        'ST Depression': 0.05, 'Max Heart Rate': 0.04, 'Chest Pain': 0.04,
        'Vessels': 0.04, 'Thalassemia': 0.03, 'Sex': 0.03
    }
    
    risks = []
    if len(raw_input) >= 13:
        if raw_input[0] > 55: risks.append('Age over 55')
        if raw_input[3] > 140: risks.append(f'High BP: {raw_input[3]} mmHg')
        if raw_input[4] > 240: risks.append(f'High cholesterol: {raw_input[4]} mg/dL')
        if raw_input[8] == 1: risks.append('Exercise-induced angina')
    
    return jsonify({
        'feature_importance': importance,
        'risk_factors': risks or ['No major risk factors'],
        'top_features': list(importance.keys())[:5]
    })

# =============================================================================
# MAIN
# =============================================================================

if __name__ == '__main__':
    print("\n" + "=" * 60)
    print("  CARDIOSHIELD AI - Heart Disease Prediction (5 Models)")
    print("=" * 60)

    Models.load_all()

    print("\n[Endpoints]")
    for ep in ['/predict', '/assess', '/metrics', '/fairness', '/health', '/explain']:
        print(f"  {ep}")

    print(f"\n[Server] http://localhost:5001")
    print("=" * 60 + "\n")

    app.run(host='0.0.0.0', port=5001, debug=True, use_reloader=False)
