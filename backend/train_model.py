"""
Training script for CardioShield AI model.
Downloads cardiovascular disease dataset and trains the model.

Usage: python train_model.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import pandas as pd
import numpy as np
from pathlib import Path
import urllib.request
import zipfile

# Setup paths
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
DATA_DIR.mkdir(exist_ok=True)
MODELS_DIR.mkdir(exist_ok=True)

def download_dataset():
    """Download cardiovascular disease dataset"""
    data_file = DATA_DIR / "cardio_train.csv"
    
    if data_file.exists():
        print("Dataset already exists, skipping download")
        return data_file
    
    print("Generating cardiovascular dataset...")
    # Generate synthetic but realistic cardiovascular data
    np.random.seed(42)
    n_samples = 10000  # Reduced for faster training
    
    # Age (in days, 30-65 years)
    age_years = np.random.normal(53, 10, n_samples).clip(30, 70)
    age = (age_years * 365).astype(int)
    
    # Gender (1=female, 2=male)
    gender = np.random.choice([1, 2], n_samples, p=[0.65, 0.35])
    
    # Height (cm)
    height = np.where(
        gender == 1,
        np.random.normal(162, 7, n_samples),
        np.random.normal(175, 8, n_samples)
    ).clip(130, 210).astype(int)
    
    # Weight (kg)
    weight = np.where(
        gender == 1,
        np.random.normal(72, 15, n_samples),
        np.random.normal(82, 16, n_samples)
    ).clip(40, 180).astype(int)
    
    # Blood pressure
    ap_hi = np.random.normal(125, 20, n_samples).clip(80, 200).astype(int)
    ap_lo = (ap_hi * np.random.uniform(0.55, 0.75, n_samples)).clip(50, 140).astype(int)
    
    # Ensure ap_hi > ap_lo
    ap_hi = np.maximum(ap_hi, ap_lo + 20)
    
    # Cholesterol (1=normal, 2=above, 3=high)
    cholesterol = np.random.choice([1, 2, 3], n_samples, p=[0.52, 0.22, 0.26])
    
    # Glucose (1=normal, 2=above, 3=high)
    gluc = np.random.choice([1, 2, 3], n_samples, p=[0.85, 0.08, 0.07])
    
    # Lifestyle factors
    smoke = np.random.choice([0, 1], n_samples, p=[0.91, 0.09])
    alco = np.random.choice([0, 1], n_samples, p=[0.95, 0.05])
    active = np.random.choice([0, 1], n_samples, p=[0.20, 0.80])
    
    # Calculate BMI
    bmi = weight / ((height / 100) ** 2)
    
    # Generate target (cardio) based on risk factors
    risk_score = (
        (ap_hi > 140).astype(float) * 0.25 +
        (ap_hi > 160).astype(float) * 0.15 +
        (cholesterol > 1).astype(float) * 0.15 +
        (cholesterol == 3).astype(float) * 0.10 +
        (age_years > 55).astype(float) * 0.15 +
        (age_years > 60).astype(float) * 0.10 +
        smoke * 0.12 +
        (1 - active) * 0.08 +
        (bmi > 30).astype(float) * 0.10 +
        (gluc > 1).astype(float) * 0.05 +
        alco * 0.03 +
        np.random.uniform(-0.15, 0.15, n_samples)  # Random noise
    )
    
    cardio = (risk_score > 0.35).astype(int)
    
    # Create DataFrame
    df = pd.DataFrame({
        'id': range(n_samples),
        'age': age,
        'gender': gender,
        'height': height,
        'weight': weight,
        'ap_hi': ap_hi,
        'ap_lo': ap_lo,
        'cholesterol': cholesterol,
        'gluc': gluc,
        'smoke': smoke,
        'alco': alco,
        'active': active,
        'cardio': cardio
    })
    
    # Save dataset
    df.to_csv(data_file, sep=';', index=False)
    print(f"Dataset saved to {data_file}")
    print(f"Total samples: {len(df)}")
    print(f"Positive cases: {cardio.sum()} ({cardio.mean()*100:.1f}%)")
    
    return data_file


def train_model():
    """Train the CardioShield model"""
    from app.ml.data_handler import DataHandler
    from app.ml.preprocessing import DataPreprocessor
    from app.ml.feature_engineering import FeatureEngineer, FeatureSelector
    from app.ml.models import CardioShieldModel
    
    print("\n" + "="*50)
    print("Training CardioShield AI Model")
    print("="*50 + "\n")
    
    # Load data
    data_file = DATA_DIR / "cardio_train.csv"
    df = DataHandler.load_csv(data_file)
    
    # Preprocess
    preprocessor = DataPreprocessor()
    df = preprocessor.clean_data(df)
    
    # Feature engineering
    df = FeatureEngineer.create_features(df)
    
    # Select features
    X_df = FeatureSelector.select_features(df)
    y = df['cardio'].values
    
    print(f"Features: {list(X_df.columns)}")
    print(f"Training samples: {len(y)}")
    print(f"Class distribution: {np.bincount(y)}")
    
    # Scale features
    X = preprocessor.fit_transform(X_df)
    
    # Train model
    model = CardioShieldModel()
    metrics = model.train(X, y, X_df.columns.tolist())
    
    print("\n" + "="*50)
    print("Model Performance")
    print("="*50)
    for metric, value in metrics.items():
        print(f"{metric:>12}: {value:.4f}")
    
    # Save model
    model_path = MODELS_DIR / "cardio_model.pkl"
    model.save(str(model_path))
    
    print(f"\nModel saved to {model_path}")
    print("\nTraining complete!")
    
    return model, preprocessor


if __name__ == "__main__":
    download_dataset()
    train_model()
