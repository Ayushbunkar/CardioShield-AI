"""
Heart Disease Prediction - Model Training Script
===============================================
This script trains a high-accuracy XGBoost model on the UCI Heart Disease dataset.

Features (13 inputs):
    1. age       - Age in years
    2. sex       - Sex (1 = male, 0 = female)
    3. cp        - Chest pain type (1-4)
    4. trestbps  - Resting blood pressure (mm Hg)
    5. chol      - Serum cholesterol (mg/dl)
    6. fbs       - Fasting blood sugar > 120 mg/dl (1 = true, 0 = false)
    7. restecg   - Resting ECG results (0, 1, 2)
    8. thalach   - Maximum heart rate achieved
    9. exang     - Exercise induced angina (1 = yes, 0 = no)
    10. oldpeak  - ST depression induced by exercise
    11. slope    - Slope of peak exercise ST segment (1-3)
    12. ca       - Number of major vessels colored by flouroscopy (0-3)
    13. thal     - Thalassemia (3 = normal, 6 = fixed defect, 7 = reversable defect)

Target:
    0 = No heart disease
    1 = Heart disease present

Run: python train_model.py
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, roc_auc_score
import xgboost as xgb
import joblib
import warnings
warnings.filterwarnings('ignore')

# Feature names for the UCI Heart Disease dataset
FEATURE_NAMES = [
    'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 
    'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'
]

def load_data():
    """Load and combine all UCI heart disease datasets."""
    # Column names including target
    columns = FEATURE_NAMES + ['target']
    
    # Load processed Cleveland data (most commonly used)
    cleveland_path = '../backend/dataset/processed.cleveland.data'
    
    try:
        df = pd.read_csv(cleveland_path, names=columns, na_values='?')
        print(f"Loaded Cleveland dataset: {len(df)} samples")
    except FileNotFoundError:
        # Try alternate path
        df = pd.read_csv('D:/Yash Coding/cardiac-ai2/CardioShield-AI/backend/dataset/processed.cleveland.data', 
                         names=columns, na_values='?')
        print(f"Loaded Cleveland dataset: {len(df)} samples")
    
    # Try to load additional datasets for more training data
    additional_files = [
        ('D:/Yash Coding/cardiac-ai2/CardioShield-AI/backend/dataset/processed.hungarian.data', 'Hungarian'),
        ('D:/Yash Coding/cardiac-ai2/CardioShield-AI/backend/dataset/processed.switzerland.data', 'Switzerland'),
        ('D:/Yash Coding/cardiac-ai2/CardioShield-AI/backend/dataset/processed.va.data', 'VA'),
    ]
    
    for filepath, name in additional_files:
        try:
            temp_df = pd.read_csv(filepath, names=columns, na_values='?')
            df = pd.concat([df, temp_df], ignore_index=True)
            print(f"Added {name} dataset: +{len(temp_df)} samples")
        except Exception as e:
            print(f"Could not load {name}: {e}")
    
    print(f"\nTotal samples: {len(df)}")
    return df

def preprocess_data(df):
    """Clean and preprocess the data."""
    print("\n--- Data Preprocessing ---")
    
    # Handle missing values
    print(f"Missing values before: {df.isnull().sum().sum()}")
    
    # Fill missing values with median for numeric columns
    for col in df.columns:
        if df[col].isnull().any():
            median_val = df[col].median()
            df[col].fillna(median_val, inplace=True)
    
    print(f"Missing values after: {df.isnull().sum().sum()}")
    
    # Convert target to binary (0 = no disease, 1 = disease present)
    # Original values are 0-4, where 0 is no disease and 1-4 is disease
    df['target'] = (df['target'] > 0).astype(int)
    
    print(f"\nTarget distribution:")
    print(f"  No Disease (0): {(df['target'] == 0).sum()}")
    print(f"  Disease (1): {(df['target'] == 1).sum()}")
    
    return df

def create_features(df):
    """Create additional engineered features for better accuracy."""
    # Make a copy to avoid modifying original
    df = df.copy()
    
    # Clip values to valid ranges to handle outliers
    df['age'] = df['age'].clip(0, 120)
    df['trestbps'] = df['trestbps'].clip(1, 299)
    df['chol'] = df['chol'].clip(1, 599)
    df['thalach'] = df['thalach'].clip(1, 250)
    
    # Age groups (using simpler approach)
    df['age_group'] = np.where(df['age'] <= 40, 0,
                      np.where(df['age'] <= 50, 1,
                      np.where(df['age'] <= 60, 2, 3)))
    
    # Heart rate reserve (simplified) - avoid division by zero
    max_hr = 220 - df['age']
    max_hr = max_hr.clip(lower=1)  # Avoid division by zero
    df['hr_reserve'] = df['thalach'] / max_hr
    
    # Blood pressure category (using simpler approach)
    df['bp_category'] = np.where(df['trestbps'] <= 120, 0,
                        np.where(df['trestbps'] <= 140, 1,
                        np.where(df['trestbps'] <= 160, 2, 3)))
    
    # Cholesterol category (using simpler approach)
    df['chol_category'] = np.where(df['chol'] <= 200, 0,
                          np.where(df['chol'] <= 240, 1, 2))
    
    # Risk score (combination of risk factors)
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
    
    # Interaction feature: age * chest pain type
    df['age_cp_interaction'] = df['age'] * df['cp']
    
    return df

def train_model(X_train, y_train, X_test, y_test):
    """Train multiple models and create an ensemble."""
    print("\n--- Model Training ---")
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # 1. XGBoost (primary model)
    xgb_model = xgb.XGBClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_weight=1,
        reg_alpha=0.1,
        reg_lambda=1.0,
        random_state=42,
        eval_metric='logloss',
        use_label_encoder=False
    )
    
    # 2. Random Forest
    rf_model = RandomForestClassifier(
        n_estimators=200,
        max_depth=6,
        min_samples_split=5,
        min_samples_leaf=2,
        max_features='sqrt',
        random_state=42,
        n_jobs=-1
    )
    
    # 3. Gradient Boosting
    gb_model = GradientBoostingClassifier(
        n_estimators=150,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.8,
        random_state=42
    )
    
    # 4. Logistic Regression
    lr_model = LogisticRegression(
        C=0.5,
        penalty='l2',
        max_iter=1000,
        random_state=42
    )
    
    # Create ensemble (Voting Classifier)
    ensemble = VotingClassifier(
        estimators=[
            ('xgb', xgb_model),
            ('rf', rf_model),
            ('gb', gb_model),
            ('lr', lr_model)
        ],
        voting='soft',  # Use probability for voting
        weights=[3, 2, 2, 1]  # XGBoost gets more weight
    )
    
    # Train individual models and evaluate
    models = {
        'XGBoost': xgb_model,
        'Random Forest': rf_model,
        'Gradient Boosting': gb_model,
        'Logistic Regression': lr_model,
        'Ensemble': ensemble
    }
    
    best_model = None
    best_accuracy = 0
    best_model_name = ''
    
    for name, model in models.items():
        if name == 'Logistic Regression':
            model.fit(X_train_scaled, y_train)
            y_pred = model.predict(X_test_scaled)
            y_proba = model.predict_proba(X_test_scaled)[:, 1]
        else:
            model.fit(X_train_scaled if name in ['Ensemble'] else X_train, y_train)
            y_pred = model.predict(X_test_scaled if name in ['Ensemble'] else X_test)
            y_proba = model.predict_proba(X_test_scaled if name in ['Ensemble'] else X_test)[:, 1]
        
        accuracy = accuracy_score(y_test, y_pred)
        auc = roc_auc_score(y_test, y_proba)
        
        print(f"\n{name}:")
        print(f"  Accuracy: {accuracy:.4f}")
        print(f"  AUC-ROC:  {auc:.4f}")
        
        if accuracy > best_accuracy:
            best_accuracy = accuracy
            best_model = model
            best_model_name = name
    
    print(f"\n*** Best Model: {best_model_name} with {best_accuracy:.4f} accuracy ***")
    
    # For simplicity, let's use XGBoost as the final model (great for production)
    # Train final XGBoost model on full data
    final_model = xgb.XGBClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_weight=1,
        reg_alpha=0.1,
        reg_lambda=1.0,
        random_state=42,
        eval_metric='logloss',
        use_label_encoder=False
    )
    
    return final_model, scaler, xgb_model

def save_model(model, scaler, feature_names):
    """Save the trained model and preprocessing objects."""
    print("\n--- Saving Model ---")
    
    model_data = {
        'model': model,
        'scaler': scaler,
        'feature_names': feature_names,
        'version': '2.0',
        'type': 'heart_disease_xgboost'
    }
    
    joblib.dump(model_data, 'heart_model.pkl')
    print("Model saved to heart_model.pkl")
    
    return model_data

def main():
    print("=" * 60)
    print("Heart Disease Prediction - Model Training")
    print("=" * 60)
    
    # Load data
    df = load_data()
    
    # Preprocess
    df = preprocess_data(df)
    
    # Create features
    df = create_features(df)
    
    # Get all feature names (original + engineered)
    all_features = FEATURE_NAMES + ['age_group', 'hr_reserve', 'bp_category', 'chol_category', 'risk_score', 'age_cp_interaction']
    
    # Prepare features and target
    X = df[all_features]
    y = df['target']
    
    print(f"\nFeatures: {X.shape[1]}")
    print(f"Samples: {X.shape[0]}")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"\nTraining set: {len(X_train)}")
    print(f"Test set: {len(X_test)}")
    
    # Train model
    final_model, scaler, xgb_model = train_model(X_train, y_train, X_test, y_test)
    
    # Cross-validation
    print("\n--- Cross-Validation ---")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(xgb_model, X, y, cv=cv, scoring='accuracy')
    print(f"CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
    
    auc_scores = cross_val_score(xgb_model, X, y, cv=cv, scoring='roc_auc')
    print(f"CV AUC-ROC: {auc_scores.mean():.4f} (+/- {auc_scores.std() * 2:.4f})")
    
    # Train final model on all data
    final_model.fit(X, y)
    
    # Final evaluation
    y_pred = final_model.predict(X)
    y_proba = final_model.predict_proba(X)[:, 1]
    
    print("\n--- Final Model Performance ---")
    print(f"Accuracy: {accuracy_score(y, y_pred):.4f}")
    print(f"AUC-ROC: {roc_auc_score(y, y_proba):.4f}")
    
    print("\nClassification Report:")
    print(classification_report(y, y_pred, target_names=['No Disease', 'Disease']))
    
    print("\nConfusion Matrix:")
    cm = confusion_matrix(y, y_pred)
    print(f"  TN: {cm[0,0]:4d}  FP: {cm[0,1]:4d}")
    print(f"  FN: {cm[1,0]:4d}  TP: {cm[1,1]:4d}")
    
    # Feature importance
    print("\n--- Feature Importance (Top 10) ---")
    importance = pd.DataFrame({
        'feature': all_features,
        'importance': final_model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    for idx, row in importance.head(10).iterrows():
        print(f"  {row['feature']:25s}: {row['importance']:.4f}")
    
    # Save model
    save_model(final_model, scaler, all_features)
    
    print("\n" + "=" * 60)
    print("Training Complete!")
    print("=" * 60)
    print("\nTo run the API:")
    print("  python app.py")
    print("\nTo make predictions:")
    print('  curl -X POST http://localhost:5000/predict \\')
    print('    -H "Content-Type: application/json" \\')
    print('    -d \'{"input": [63, 1, 1, 145, 233, 1, 2, 150, 0, 2.3, 3, 0, 6]}\'')

if __name__ == '__main__':
    main()
