# CardioShield AI Backend

Heart Disease Risk Prediction API using multiple Machine Learning models (XGBoost, TabNet, Neural Network, and Ensemble) trained on 70,000+ cardiovascular disease records.

![Python](https://img.shields.io/badge/python-3.10+-blue)
![Flask](https://img.shields.io/badge/flask-2.3+-green)

---

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Input Format](#input-format)
- [Example Requests](#example-requests)
- [Project Structure](#project-structure)
- [Model Information](#model-information)

---

## Features

- **Multi-Model Predictions**: XGBoost, TabNet, Neural Network, and Weighted Ensemble
- **Quick Predictions**: Fast single-model prediction endpoint
- **Full Assessments**: Comprehensive multi-model assessment with recommendations
- **Model Metrics**: Performance metrics for all models
- **Fairness Analysis**: Bias detection across demographic groups
- **Feature Explainability**: Understand prediction factors

---

## Prerequisites

- Python 3.10 or higher
- pip (Python package manager)

---

## Installation

### Step 1: Navigate to ai-backend directory

```powershell
cd ai-backend
```

### Step 2: Create virtual environment

```powershell
# Windows PowerShell
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Windows Command Prompt
python -m venv .venv
.venv\Scripts\activate.bat

# macOS/Linux
python3 -m venv .venv
source .venv/bin/activate
```

### Step 3: Install dependencies

```powershell
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 4: Train models (if not present)

```powershell
python train_models.py
```

---

## Running the Server

```powershell
# Ensure virtual environment is activated
python app.py
```

Server runs at: **http://localhost:5001**

Expected output:
```
[Loading Models]
    ✓ XGBoost loaded
    ✓ TabNet loaded
    ✓ NN loaded
    ✓ Ensemble loaded
    ✓ Scaler loaded
 * Running on http://localhost:5001
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check & model status |
| POST | `/predict` | Quick prediction (XGBoost) |
| POST | `/assess` | Full multi-model assessment |
| GET | `/metrics` | Model performance metrics |
| GET | `/fairness` | Fairness analysis data |
| POST | `/explain` | Feature importance explanation |

---

## Input Format

### Option 1: Array Input

11-element array in order:
```
[age, gender, height, weight, ap_hi, ap_lo, cholesterol, gluc, smoke, alco, active]
```

```json
{
  "input": [55, 2, 175, 80, 130, 85, 2, 1, 0, 0, 1]
}
```

### Option 2: Object Input

```json
{
  "patientData": {
    "age": 55,
    "gender": 2,
    "height": 175,
    "weight": 80,
    "ap_hi": 130,
    "ap_lo": 85,
    "cholesterol": 2,
    "gluc": 1,
    "smoke": 0,
    "alco": 0,
    "active": 1
  }
}
```

### Field Reference

| Field | Type | Description | Valid Values |
|-------|------|-------------|--------------|
| `age` | int | Age in years | 18-100 |
| `gender` | int | Gender | 1=Female, 2=Male |
| `height` | float | Height in cm | 100-250 |
| `weight` | float | Weight in kg | 30-200 |
| `ap_hi` | int | Systolic BP | 80-250 |
| `ap_lo` | int | Diastolic BP | 40-150 |
| `cholesterol` | int | Cholesterol | 1=Normal, 2=Above, 3=Well Above |
| `gluc` | int | Glucose | 1=Normal, 2=Above, 3=Well Above |
| `smoke` | int | Smoking | 0=No, 1=Yes |
| `alco` | int | Alcohol | 0=No, 1=Yes |
| `active` | int | Physical activity | 0=No, 1=Yes |

---

## Example Requests

### Health Check

```bash
curl http://localhost:5001/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "CardioShield AI",
  "version": "2.1.0",
  "models": {
    "lightgbm": true,
    "xgboost": true,
    "tabnet": true,
    "neural_network": true,
    "ensemble": true
  }
}
```

### Quick Prediction

```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{"input": [55, 2, 175, 80, 130, 85, 2, 1, 0, 0, 1]}'
```

**Response:**
```json
{
  "prediction": 1,
  "probability": {
    "disease": 0.6523,
    "no_disease": 0.3477
  },
  "risk_level": "High",
  "confidence": 0.6523,
  "model_type": "XGBoost",
  "dataset": "Cardiovascular Disease (70,000 records)"
}
```

### Full Assessment

```bash
curl -X POST http://localhost:5001/assess \
  -H "Content-Type: application/json" \
  -d '{
    "patientData": {
      "age": 55,
      "gender": 2,
      "height": 175,
      "weight": 80,
      "ap_hi": 130,
      "ap_lo": 85,
      "cholesterol": 2,
      "gluc": 1,
      "smoke": 0,
      "alco": 0,
      "active": 1
    }
  }'
```

### Model Metrics

```bash
curl http://localhost:5001/metrics
```

### Fairness Analysis

```bash
curl http://localhost:5001/fairness
```

---

## Project Structure

```
ai-backend/
├── app.py                    # Flask API server (~800 lines)
├── train_models.py           # Model training script
├── test_api.py               # API tests
├── requirements.txt          # Python dependencies
├── README.md                 # This file
└── models/
    ├── cardio_train.csv      # Training dataset (70K records)
    ├── xgboost_model.pkl     # Trained XGBoost model
    ├── tabnet_model.pkl      # Trained TabNet model
    ├── nn_model.pkl          # Trained Neural Network
    ├── ensemble_model.pkl    # Weighted Ensemble
    ├── scaler.pkl            # Feature scaler
    ├── feature_names.pkl     # Feature column names
    ├── training_results.pkl  # Training metrics
    └── heart_disease_predictor.pk2  # LightGBM model
```

---

## Model Information

### Models Used

| Model | Type | AUC | Accuracy |
|-------|------|-----|----------|
| XGBoost | Gradient Boosting | 0.80 | 73% |
| GradientBoosting | Gradient Boosting | 0.79 | 73% |
| Neural Network | Deep Learning | 0.79 | 73% |
| Weighted Ensemble | Combined | 0.80 | 73% |

### Dataset

- **Source**: Cardiovascular Disease Dataset
- **Records**: 70,000
- **Features**: 11 base features + engineered features
- **Target**: Binary (cardio disease: 0/1)

### Engineered Features

The models also use these derived features:
- BMI (Body Mass Index)
- Pulse Pressure
- Mean Arterial Pressure
- Age-BP Interaction
- Metabolic Risk Score
- Lifestyle Risk Score
- BMI/BP/Age Categories

---

## Dependencies

```
flask>=2.3.0
flask-cors>=4.0.0
numpy>=1.23.0
pandas>=2.0.0
scikit-learn>=1.2.0
joblib>=1.2.0
lightgbm>=3.3.0
```

---

## Troubleshooting

### Models not loading
```
Error: XGBoost model not loaded
```
**Solution:** Run `python train_models.py` to train and save models.

### Port already in use
**Solution:** Change port in `app.py` or kill process using port 5001.

### Import errors
**Solution:** Ensure virtual environment is activated and all dependencies installed.

---

## Integration

This AI backend integrates with:
- **Main Server**: Proxied through Node.js server at `/ai/*`
- **Frontend**: React client calls through the main server

For full project documentation, see the main [README.md](../README.md).
