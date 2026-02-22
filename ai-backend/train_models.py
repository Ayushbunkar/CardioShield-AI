"""
CardioShield AI - Model Training Script
========================================
Trains XGBoost, TabNet, Neural Network, and Stacked Ensemble models.
Saves all models to ai-backend/models/ for use by the Flask API.
"""

import os
import numpy as np
import pandas as pd
import joblib
import warnings
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier
from sklearn.ensemble import GradientBoostingClassifier
from xgboost import XGBClassifier

warnings.filterwarnings('ignore')

# =============================================================================
# CONFIG
# =============================================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')
os.makedirs(MODELS_DIR, exist_ok=True)

# =============================================================================
# SYNTHETIC DATA GENERATOR (Framingham-like)
# =============================================================================

def generate_framingham_data(n_samples=4000):
    """Generate synthetic Framingham-like heart disease data."""
    np.random.seed(42)
    
    # Demographics
    male = np.random.binomial(1, 0.45, n_samples)
    age = np.random.normal(50, 12, n_samples).clip(30, 80).astype(int)
    education = np.random.choice([1, 2, 3, 4], n_samples, p=[0.2, 0.35, 0.3, 0.15])
    
    # Smoking
    currentSmoker = np.random.binomial(1, 0.4, n_samples)
    cigsPerDay = np.where(currentSmoker == 1, np.random.poisson(15, n_samples), 0)
    
    # Medical history
    BPMeds = np.random.binomial(1, 0.05, n_samples)
    prevalentStroke = np.random.binomial(1, 0.01, n_samples)
    prevalentHyp = np.random.binomial(1, 0.3, n_samples)
    diabetes = np.random.binomial(1, 0.03, n_samples)
    
    # Clinical measurements
    totChol = np.random.normal(240, 45, n_samples).clip(100, 400)
    sysBP = np.random.normal(130, 22, n_samples).clip(90, 200)
    diaBP = np.random.normal(82, 12, n_samples).clip(50, 130)
    BMI = np.random.normal(26, 4.5, n_samples).clip(15, 50)
    heartRate = np.random.normal(75, 12, n_samples).clip(50, 120)
    glucose = np.random.normal(85, 25, n_samples).clip(50, 200)
    
    # Target: 10-year CHD risk
    risk_score = (
        0.03 * (age - 50) +
        0.15 * male +
        0.02 * currentSmoker * np.log1p(cigsPerDay) +
        0.2 * prevalentHyp +
        0.3 * diabetes +
        0.01 * (sysBP - 120) / 10 +
        0.005 * (totChol - 200) / 20 +
        0.02 * (BMI - 25) / 5 +
        0.15 * prevalentStroke +
        np.random.normal(0, 0.3, n_samples)
    )
    TenYearCHD = (risk_score > np.percentile(risk_score, 85)).astype(int)
    
    return pd.DataFrame({
        'male': male, 'age': age, 'education': education,
        'currentSmoker': currentSmoker, 'cigsPerDay': cigsPerDay,
        'BPMeds': BPMeds, 'prevalentStroke': prevalentStroke,
        'prevalentHyp': prevalentHyp, 'diabetes': diabetes,
        'totChol': totChol, 'sysBP': sysBP, 'diaBP': diaBP,
        'BMI': BMI, 'heartRate': heartRate, 'glucose': glucose,
        'TenYearCHD': TenYearCHD
    })

# =============================================================================
# FEATURE ENGINEERING
# =============================================================================

def engineer_features(df):
    """Add derived features."""
    df = df.copy()
    df['pulse_pressure'] = df['sysBP'] - df['diaBP']
    df['MAP'] = (df['sysBP'] + 2 * df['diaBP']) / 3
    df['age_risk'] = pd.cut(df['age'], bins=[0, 40, 50, 60, 100], labels=[1, 2, 3, 4]).astype(int)
    df['smoking_intensity'] = df['currentSmoker'] * df['cigsPerDay']
    df['chol_age_ratio'] = df['totChol'] / df['age']
    return df

# =============================================================================
# TRAINING
# =============================================================================

def train_models():
    """Train all models and save to disk."""
    print("\n" + "=" * 60)
    print("  CARDIOSHIELD AI - MODEL TRAINING")
    print("=" * 60)
    
    # Generate data
    print("\n[1] Generating training data...")
    df = generate_framingham_data(4000)
    df = engineer_features(df)
    print(f"    Dataset: {len(df)} samples, {len(df.columns)} features")
    
    # Prepare features and target
    X = df.drop('TenYearCHD', axis=1)
    y = df['TenYearCHD']
    feature_names = list(X.columns)
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"    Train: {len(X_train)}, Test: {len(X_test)}")
    
    # Scale features
    print("\n[2] Scaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Save scaler
    joblib.dump(scaler, os.path.join(MODELS_DIR, 'scaler.pkl'))
    joblib.dump(feature_names, os.path.join(MODELS_DIR, 'feature_names.pkl'))
    print("    ✓ Scaler saved")
    
    # Train XGBoost
    print("\n[3] Training XGBoost...")
    xgb_model = XGBClassifier(
        n_estimators=100, max_depth=5, learning_rate=0.1,
        random_state=42, eval_metric='logloss', use_label_encoder=False
    )
    xgb_model.fit(X_train_scaled, y_train)
    xgb_acc = xgb_model.score(X_test_scaled, y_test)
    joblib.dump(xgb_model, os.path.join(MODELS_DIR, 'xgboost_model.pkl'))
    print(f"    ✓ XGBoost saved (Accuracy: {xgb_acc:.4f})")
    
    # Train TabNet (GradientBoosting fallback for compatibility)
    print("\n[4] Training TabNet...")
    try:
        from pytorch_tabnet.tab_model import TabNetClassifier
        tabnet_model = TabNetClassifier(verbose=0, seed=42)
        tabnet_model.fit(X_train_scaled, y_train.values, 
                        eval_set=[(X_test_scaled, y_test.values)],
                        max_epochs=50, patience=10)
        tabnet_acc = tabnet_model.score(X_test_scaled, y_test.values)
        joblib.dump(tabnet_model, os.path.join(MODELS_DIR, 'tabnet_model.pkl'))
        print(f"    ✓ TabNet saved (Accuracy: {tabnet_acc:.4f})")
    except Exception as e:
        print(f"    ! TabNet unavailable: {e}")
        print("    Using GradientBoosting as fallback...")
        tabnet_model = GradientBoostingClassifier(
            n_estimators=100, max_depth=4, random_state=42
        )
        tabnet_model.fit(X_train_scaled, y_train)
        tabnet_acc = tabnet_model.score(X_test_scaled, y_test)
        joblib.dump(tabnet_model, os.path.join(MODELS_DIR, 'tabnet_model.pkl'))
        print(f"    ✓ TabNet (GB fallback) saved (Accuracy: {tabnet_acc:.4f})")
    
    # Train Neural Network
    print("\n[5] Training Neural Network...")
    nn_model = MLPClassifier(
        hidden_layer_sizes=(128, 64, 32),
        activation='relu', solver='adam',
        max_iter=500, random_state=42,
        early_stopping=True, validation_fraction=0.15
    )
    nn_model.fit(X_train_scaled, y_train)
    nn_acc = nn_model.score(X_test_scaled, y_test)
    joblib.dump(nn_model, os.path.join(MODELS_DIR, 'nn_model.pkl'))
    print(f"    ✓ Neural Network saved (Accuracy: {nn_acc:.4f})")
    
    # Train Stacked Ensemble
    print("\n[6] Training Stacked Ensemble...")
    xgb_proba = xgb_model.predict_proba(X_train_scaled)[:, 1]
    tabnet_proba = tabnet_model.predict_proba(X_train_scaled)[:, 1]
    nn_proba = nn_model.predict_proba(X_train_scaled)[:, 1]
    
    stacked_features = np.column_stack([xgb_proba, tabnet_proba, nn_proba])
    ensemble_model = LogisticRegression(random_state=42)
    ensemble_model.fit(stacked_features, y_train)
    
    # Evaluate ensemble
    xgb_test = xgb_model.predict_proba(X_test_scaled)[:, 1]
    tabnet_test = tabnet_model.predict_proba(X_test_scaled)[:, 1]
    nn_test = nn_model.predict_proba(X_test_scaled)[:, 1]
    stacked_test = np.column_stack([xgb_test, tabnet_test, nn_test])
    ensemble_acc = ensemble_model.score(stacked_test, y_test)
    
    joblib.dump(ensemble_model, os.path.join(MODELS_DIR, 'ensemble_model.pkl'))
    print(f"    ✓ Stacked Ensemble saved (Accuracy: {ensemble_acc:.4f})")
    
    # Summary
    print("\n" + "=" * 60)
    print("  TRAINING COMPLETE")
    print("=" * 60)
    print(f"\n  Models saved to: {MODELS_DIR}")
    print("\n  Model Performance:")
    print(f"    XGBoost:          {xgb_acc:.4f}")
    print(f"    TabNet:           {tabnet_acc:.4f}")
    print(f"    Neural Network:   {nn_acc:.4f}")
    print(f"    Stacked Ensemble: {ensemble_acc:.4f}")
    print("\n" + "=" * 60 + "\n")

if __name__ == '__main__':
    train_models()
