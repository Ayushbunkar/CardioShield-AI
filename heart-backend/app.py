"""
Heart Disease Prediction API - Flask Backend
=============================================
A production-ready Flask API for heart disease prediction using 
the UCI Heart Disease dataset with XGBoost model.

Endpoints:
    POST /predict  - Make a heart disease prediction
    GET  /health   - Health check endpoint
    GET  /info     - Model and feature information

Feature Input (13 values):
    age, sex, cp, trestbps, chol, fbs, restecg, thalach, 
    exang, oldpeak, slope, ca, thal

Run: python app.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import joblib
import os
import traceback

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Feature names for the 13 input features
FEATURE_NAMES = [
    'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 
    'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'
]

# Feature descriptions for API documentation
FEATURE_INFO = {
    'age': {'description': 'Age in years', 'type': 'float', 'range': '29-77'},
    'sex': {'description': 'Sex (0 = female, 1 = male)', 'type': 'int', 'range': '0-1'},
    'cp': {'description': 'Chest pain type (1-4)', 'type': 'int', 'range': '1-4'},
    'trestbps': {'description': 'Resting blood pressure (mm Hg)', 'type': 'float', 'range': '94-200'},
    'chol': {'description': 'Serum cholesterol (mg/dl)', 'type': 'float', 'range': '126-564'},
    'fbs': {'description': 'Fasting blood sugar > 120 mg/dl (0 = false, 1 = true)', 'type': 'int', 'range': '0-1'},
    'restecg': {'description': 'Resting ECG results (0-2)', 'type': 'int', 'range': '0-2'},
    'thalach': {'description': 'Maximum heart rate achieved', 'type': 'float', 'range': '71-202'},
    'exang': {'description': 'Exercise induced angina (0 = no, 1 = yes)', 'type': 'int', 'range': '0-1'},
    'oldpeak': {'description': 'ST depression induced by exercise', 'type': 'float', 'range': '0-6.2'},
    'slope': {'description': 'Slope of peak exercise ST segment (1-3)', 'type': 'int', 'range': '1-3'},
    'ca': {'description': 'Number of major vessels colored by flouroscopy', 'type': 'int', 'range': '0-3'},
    'thal': {'description': 'Thalassemia (3=normal, 6=fixed defect, 7=reversable defect)', 'type': 'int', 'range': '3,6,7'}
}

# Global model variable
model_data = None

def load_model():
    """Load the trained model from disk."""
    global model_data
    model_path = os.path.join(os.path.dirname(__file__), 'heart_model.pkl')
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}. Please run train_model.py first.")
    
    model_data = joblib.load(model_path)
    print(f"Model loaded successfully (version: {model_data.get('version', 'unknown')})")
    return model_data

def create_features(input_array):
    """Create engineered features from the 13 input features."""
    # Create DataFrame with input
    df = pd.DataFrame([input_array], columns=FEATURE_NAMES)
    
    # Clip values to valid ranges
    df['age'] = df['age'].clip(0, 120)
    df['trestbps'] = df['trestbps'].clip(1, 299)
    df['chol'] = df['chol'].clip(1, 599)
    df['thalach'] = df['thalach'].clip(1, 250)
    
    # Age groups
    df['age_group'] = np.where(df['age'] <= 40, 0,
                      np.where(df['age'] <= 50, 1,
                      np.where(df['age'] <= 60, 2, 3)))
    
    # Heart rate reserve (simplified)
    max_hr = 220 - df['age']
    max_hr = max_hr.clip(lower=1)
    df['hr_reserve'] = df['thalach'] / max_hr
    
    # Blood pressure category
    df['bp_category'] = np.where(df['trestbps'] <= 120, 0,
                        np.where(df['trestbps'] <= 140, 1,
                        np.where(df['trestbps'] <= 160, 2, 3)))
    
    # Cholesterol category
    df['chol_category'] = np.where(df['chol'] <= 200, 0,
                          np.where(df['chol'] <= 240, 1, 2))
    
    # Risk score
    df['risk_score'] = (
        (df['age'] > 55).astype(int) +
        df['sex'].astype(int) +
        (df['cp'] == 4).astype(int) +
        (df['trestbps'] > 140).astype(int) +
        (df['chol'] > 240).astype(int) +
        df['fbs'].astype(int) +
        df['exang'].astype(int) +
        (df['oldpeak'] > 2).astype(int) +
        (df['ca'] > 0).astype(int)
    )
    
    # Interaction feature
    df['age_cp_interaction'] = df['age'] * df['cp']
    
    return df

def validate_input(input_data):
    """Validate the input data for prediction."""
    if input_data is None:
        return False, "Missing 'input' field in request body"
    
    if not isinstance(input_data, list):
        return False, f"'input' must be a list, got {type(input_data).__name__}"
    
    if len(input_data) != 13:
        return False, f"'input' must contain exactly 13 values, got {len(input_data)}"
    
    # Check all values are numeric
    for i, val in enumerate(input_data):
        if not isinstance(val, (int, float)):
            return False, f"Value at index {i} ({FEATURE_NAMES[i]}) must be numeric, got {type(val).__name__}"
        if np.isnan(val) or np.isinf(val):
            return False, f"Value at index {i} ({FEATURE_NAMES[i]}) cannot be NaN or Inf"
    
    return True, None

@app.route('/predict', methods=['POST'])
def predict():
    """
    Make a heart disease prediction.
    
    Request Body:
        {
            "input": [age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal]
        }
    
    Response:
        {
            "prediction": 0 or 1,
            "probability": {
                "no_disease": float,
                "disease": float
            },
            "risk_level": "Low" | "Moderate" | "High" | "Very High",
            "confidence": float
        }
    """
    try:
        # Check if model is loaded
        if model_data is None:
            return jsonify({
                "error": "Model not loaded. Please ensure the model is trained and loaded."
            }), 503
        
        # Get JSON data
        data = request.get_json()
        
        if data is None:
            return jsonify({
                "error": "Invalid JSON body. Content-Type must be application/json."
            }), 400
        
        # Extract input
        input_data = data.get('input')
        
        # Validate input
        is_valid, error_msg = validate_input(input_data)
        if not is_valid:
            return jsonify({"error": error_msg}), 400
        
        # Convert to numpy array
        input_array = np.array(input_data, dtype=np.float64)
        
        # Create features (including engineered features)
        features_df = create_features(input_array)
        
        # Get feature names from model
        expected_features = model_data.get('feature_names', features_df.columns.tolist())
        
        # Ensure we have all expected features
        X = features_df[expected_features].values
        
        # Make prediction
        model = model_data['model']
        prediction = int(model.predict(X)[0])
        probabilities = model.predict_proba(X)[0]
        
        # Calculate confidence
        confidence = float(max(probabilities))
        
        # Determine risk level based on disease probability
        disease_prob = float(probabilities[1])
        if disease_prob < 0.25:
            risk_level = "Low"
        elif disease_prob < 0.50:
            risk_level = "Moderate"
        elif disease_prob < 0.75:
            risk_level = "High"
        else:
            risk_level = "Very High"
        
        return jsonify({
            "prediction": prediction,
            "probability": {
                "no_disease": round(float(probabilities[0]), 4),
                "disease": round(float(probabilities[1]), 4)
            },
            "risk_level": risk_level,
            "confidence": round(confidence, 4)
        })
        
    except Exception as e:
        print(f"Prediction error: {traceback.format_exc()}")
        return jsonify({
            "error": f"Prediction failed: {str(e)}"
        }), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "model_loaded": model_data is not None,
        "model_version": model_data.get('version', 'unknown') if model_data else None
    })

@app.route('/info', methods=['GET'])
def info():
    """Get model and feature information."""
    return jsonify({
        "model_type": "Heart Disease Prediction (UCI Dataset)",
        "algorithm": "XGBoost",
        "num_features": 13,
        "features": FEATURE_INFO,
        "feature_order": FEATURE_NAMES,
        "target": {
            "0": "No heart disease",
            "1": "Heart disease present"
        },
        "example_request": {
            "input": [63, 1, 1, 145, 233, 1, 2, 150, 0, 2.3, 3, 0, 6]
        }
    })

@app.route('/', methods=['GET'])
def root():
    """Root endpoint with API documentation."""
    return jsonify({
        "name": "Heart Disease Prediction API",
        "version": "1.0",
        "endpoints": {
            "POST /predict": "Make a heart disease prediction",
            "GET /health": "Health check",
            "GET /info": "Model and feature information"
        },
        "usage": {
            "method": "POST",
            "url": "/predict",
            "body": {
                "input": "[age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal]"
            }
        }
    })

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Internal server error"}), 500

@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"error": "Method not allowed"}), 405

if __name__ == '__main__':
    print("=" * 60)
    print("Heart Disease Prediction API")
    print("=" * 60)
    
    # Load model on startup
    try:
        load_model()
    except FileNotFoundError as e:
        print(f"\nWARNING: {e}")
        print("The API will start but predictions will fail until the model is trained.")
        print("Run: python train_model.py\n")
    
    print("\nStarting Flask server...")
    print("API running at: http://localhost:5000")
    print("\nExample prediction:")
    print('curl -X POST http://localhost:5000/predict \\')
    print('  -H "Content-Type: application/json" \\')
    print('  -d \'{"input": [63, 1, 1, 145, 233, 1, 2, 150, 0, 2.3, 3, 0, 6]}\'')
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
