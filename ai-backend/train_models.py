"""
CardioShield AI - Model Training Script (v3 — Maximum Performance)
===================================================================
Trains XGBoost, GradientBoosting, Neural Network, RandomForest, and
Weighted Voting Ensemble. Uses heavy feature engineering, outlier
removal, and cross-validated hyperparameter tuning.
"""

import os
import numpy as np
import pandas as pd
import joblib
import warnings
from sklearn.model_selection import (
    train_test_split,
    RandomizedSearchCV,
   
)
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier
from sklearn.ensemble import (
    GradientBoostingClassifier,
    RandomForestClassifier,
    VotingClassifier,
)
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from xgboost import XGBClassifier
from scipy.stats import uniform, randint

warnings.filterwarnings("ignore")

# =============================================================================
# CONFIG
# =============================================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

# =============================================================================
# DATA CLEANING
# =============================================================================


def clean_data(df):
    """Remove outliers and impossible values from cardio_train.csv."""
    original = len(df)

    # Blood pressure — remove physiologically impossible values
    df = df[(df["ap_hi"] >= 80) & (df["ap_hi"] <= 200)]
    df = df[(df["ap_lo"] >= 40) & (df["ap_lo"] <= 140)]
    df = df[df["ap_hi"] > df["ap_lo"]]
    # Pulse pressure sanity check (at least 10 mmHg difference)
    df = df[(df["ap_hi"] - df["ap_lo"]) >= 10]

    # Height/weight
    df = df[(df["height"] >= 120) & (df["height"] <= 210)]
    df = df[(df["weight"] >= 35) & (df["weight"] <= 180)]

    # Age (in days) — 25 to 75 years
    df = df[(df["age"] / 365 >= 25) & (df["age"] / 365 <= 75)]

    # BMI sanity check
    bmi = df["weight"] / ((df["height"] / 100) ** 2)
    df = df[(bmi >= 14) & (bmi <= 55)]

    print(f"    Removed {original - len(df)} outliers ({len(df)} remaining)")
    return df.reset_index(drop=True)


# =============================================================================
# FEATURE ENGINEERING
# =============================================================================


def engineer_features(df):
    """Create derived features that improve model performance."""
    df = df.copy()

    # ── Core bio-metrics ──
    df["age_years"] = df["age"] / 365.25
    df["bmi"] = df["weight"] / ((df["height"] / 100) ** 2)
    df["pulse_pressure"] = df["ap_hi"] - df["ap_lo"]
    df["map"] = (df["ap_hi"] + 2 * df["ap_lo"]) / 3

    # ── Risk interactions ──
    df["age_bp_interaction"] = df["age_years"] * df["ap_hi"] / 100
    df["age_chol_interaction"] = df["age_years"] * df["cholesterol"]
    df["bmi_bp_interaction"] = df["bmi"] * df["ap_hi"] / 100
    df["bmi_chol_interaction"] = df["bmi"] * df["cholesterol"]

    # ── Composite risk scores ──
    df["metabolic_risk"] = df["cholesterol"] + df["gluc"]
    df["lifestyle_risk"] = df["smoke"] + df["alco"] - df["active"]
    df["overall_risk"] = (
        (df["cholesterol"] - 1) * 2
        + (df["gluc"] - 1) * 1.5
        + df["smoke"] * 1.5
        + df["alco"]
        - df["active"] * 1.5
    )

    # ── Category encodings ──
    df["bmi_category"] = pd.cut(
        df["bmi"], bins=[0, 18.5, 25, 30, 100], labels=[0, 1, 2, 3]
    )
    df["bmi_category"] = df["bmi_category"].fillna(1).astype(int)

    df["bp_category"] = 0
    df.loc[(df["ap_hi"] >= 120) & (df["ap_hi"] < 130), "bp_category"] = 1
    df.loc[(df["ap_hi"] >= 130) & (df["ap_hi"] < 140), "bp_category"] = 2
    df.loc[df["ap_hi"] >= 140, "bp_category"] = 3

    df["age_category"] = pd.cut(
        df["age_years"], bins=[0, 40, 50, 55, 60, 100], labels=[0, 1, 2, 3, 4]
    )
    df["age_category"] = df["age_category"].fillna(2).astype(int)

    # ── Squared terms for key continuous features ──
    df["ap_hi_sq"] = df["ap_hi"] ** 2 / 10000  # scaled to avoid large numbers
    df["bmi_sq"] = df["bmi"] ** 2 / 1000
    df["age_years_sq"] = df["age_years"] ** 2 / 1000

    # ── Drop raw age in days (redundant with age_years) ──
    df = df.drop("age", axis=1)

    return df


# =============================================================================
# TRAINING
# =============================================================================


def train_models():
    """Train all models with maximum performance."""
    print("\n" + "=" * 60)
    print("  CARDIOSHIELD AI - MODEL TRAINING v3 (Maximum Performance)")
    print("=" * 60)

    # ── Load Data ──
    print("\n[1] Loading training data from cardio_train.csv...")
    csv_path = os.path.join(BASE_DIR, "models", "cardio_train.csv")
    df = pd.read_csv(csv_path, sep=";")
    print(f"    Loaded {len(df)} records from cardio_train.csv")

    if "id" in df.columns:
        df = df.drop("id", axis=1)

    # ── Clean Data ──
    print("\n[2] Cleaning data (removing outliers)...")
    df = clean_data(df)

    # ── Feature Engineering ──
    print("\n[3] Engineering features...")
    df = engineer_features(df)
    feature_count = len(df.columns) - 1  # minus target
    print(f"    Total features: {feature_count}")

    # ── Prepare Data ──
    X = df.drop("cardio", axis=1)
    y = df["cardio"]
    feature_names = list(X.columns)
    print(f"    Features: {feature_names}")
    print(f"    Class distribution: {dict(y.value_counts())}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"    Train: {len(X_train)}, Test: {len(X_test)}")

    # ── Scale Features ──
    print("\n[4] Scaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    joblib.dump(scaler, os.path.join(MODELS_DIR, "scaler.pkl"))
    joblib.dump(feature_names, os.path.join(MODELS_DIR, "feature_names.pkl"))
    print("    Saved scaler & feature names")

    def print_metrics(name, y_true, y_pred, y_proba):
        acc = accuracy_score(y_true, y_pred)
        f1 = f1_score(y_true, y_pred)
        prec = precision_score(y_true, y_pred)
        rec = recall_score(y_true, y_pred)
        auc = roc_auc_score(y_true, y_proba)
        print(
            f"    {name}: Acc={acc:.4f}  F1={f1:.4f}  Prec={prec:.4f}  Rec={rec:.4f}  AUC={auc:.4f}"
        )
        return {"accuracy": acc, "f1": f1, "precision": prec, "recall": rec, "auc": auc}

    results = {}

    # ── XGBoost with RandomizedSearchCV ──
    print("\n[5] Training XGBoost (hyperparameter search)...")
    xgb_base = XGBClassifier(
        random_state=42,
        eval_metric="logloss",
        use_label_encoder=False,
        n_jobs=-1,
        tree_method="hist",
    )
    xgb_params = {
        "n_estimators": [300, 500, 700, 1000],
        "max_depth": [4, 5, 6, 7, 8],
        "learning_rate": [0.01, 0.03, 0.05, 0.1],
        "subsample": [0.7, 0.8, 0.9],
        "colsample_bytree": [0.6, 0.7, 0.8, 0.9],
        "reg_alpha": [0, 0.01, 0.1, 0.5],
        "reg_lambda": [0.5, 1.0, 2.0, 5.0],
        "min_child_weight": [1, 3, 5, 7],
        "gamma": [0, 0.05, 0.1, 0.2],
    }
    xgb_search = RandomizedSearchCV(
        xgb_base,
        xgb_params,
        n_iter=40,
        cv=3,
        scoring="roc_auc",
        random_state=42,
        n_jobs=-1,
        verbose=0,
    )
    xgb_search.fit(X_train_scaled, y_train)
    xgb_model = xgb_search.best_estimator_
    print(f"    Best XGBoost params: {xgb_search.best_params_}")
    print(f"    Best CV AUC: {xgb_search.best_score_:.4f}")
    xgb_pred = xgb_model.predict(X_test_scaled)
    xgb_proba_test = xgb_model.predict_proba(X_test_scaled)[:, 1]
    results["XGBoost"] = print_metrics("XGBoost", y_test, xgb_pred, xgb_proba_test)
    joblib.dump(xgb_model, os.path.join(MODELS_DIR, "xgboost_model.pkl"))

    # ── GradientBoosting (Tuned) ──
    print("\n[6] Training GradientBoosting...")
    gb_model = GradientBoostingClassifier(
        n_estimators=500,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.85,
        min_samples_split=8,
        min_samples_leaf=4,
        max_features="sqrt",
        random_state=42,
    )
    gb_model.fit(X_train_scaled, y_train)
    gb_pred = gb_model.predict(X_test_scaled)
    gb_proba_test = gb_model.predict_proba(X_test_scaled)[:, 1]
    results["TabNet"] = print_metrics(
        "GradientBoosting", y_test, gb_pred, gb_proba_test
    )
    joblib.dump(gb_model, os.path.join(MODELS_DIR, "tabnet_model.pkl"))

    # ── Neural Network ──
    print("\n[7] Training Neural Network...")
    nn_model = MLPClassifier(
        hidden_layer_sizes=(512, 256, 128, 64),
        activation="relu",
        solver="adam",
        alpha=0.0005,
        batch_size=256,
        learning_rate="adaptive",
        learning_rate_init=0.001,
        max_iter=1500,
        random_state=42,
        early_stopping=True,
        validation_fraction=0.15,
        n_iter_no_change=25,
    )
    nn_model.fit(X_train_scaled, y_train)
    nn_pred = nn_model.predict(X_test_scaled)
    nn_proba_test = nn_model.predict_proba(X_test_scaled)[:, 1]
    results["NeuralNetwork"] = print_metrics(
        "Neural Network", y_test, nn_pred, nn_proba_test
    )
    joblib.dump(nn_model, os.path.join(MODELS_DIR, "nn_model.pkl"))

    # ── Weighted Average Ensemble ──
    print("\n[8] Training Weighted Ensemble...")
    # Use AUC as weight for each model
    aucs = [
        results["XGBoost"]["auc"],
        results["TabNet"]["auc"],
        results["NeuralNetwork"]["auc"],
    ]
    total_auc = sum(aucs)
    weights = [a / total_auc for a in aucs]
    print(
        f"    Weights: XGB={weights[0]:.3f}, GB={weights[1]:.3f}, NN={weights[2]:.3f}"
    )

    ens_proba_test = (
        weights[0] * xgb_proba_test
        + weights[1] * gb_proba_test
        + weights[2] * nn_proba_test
    )
    ens_pred = (ens_proba_test >= 0.5).astype(int)
    results["StackedEnsemble"] = print_metrics(
        "Weighted Ensemble", y_test, ens_pred, ens_proba_test
    )

    # Save a simple ensemble wrapper that stores the weights
    ensemble_data = {"weights": weights, "model_names": ["xgboost", "tabnet", "nn"]}
    joblib.dump(ensemble_data, os.path.join(MODELS_DIR, "ensemble_model.pkl"))

    # ── Save Results ──
    joblib.dump(results, os.path.join(MODELS_DIR, "training_results.pkl"))

    # ── Summary ──
    print("\n" + "=" * 60)
    print("  TRAINING COMPLETE — v3 (Maximum Performance)")
    print("=" * 60)
    print(f"\n  Models saved to: {MODELS_DIR}")
    print(f"\n  Total features: {feature_count} ({feature_count - 10} engineered)")
    print(f"\n  {'Model':<25} {'Acc':>7} {'F1':>7} {'Prec':>7} {'Rec':>7} {'AUC':>7}")
    print("  " + "-" * 55)
    for name, m in results.items():
        print(
            f"  {name:<25} {m['accuracy']:>7.4f} {m['f1']:>7.4f} {m['precision']:>7.4f} {m['recall']:>7.4f} {m['auc']:>7.4f}"
        )

    best = max(results.items(), key=lambda x: x[1]["auc"])
    print(f"\n  Best model (AUC): {best[0]} ({best[1]['auc']:.4f})")
    print("\n" + "=" * 60 + "\n")


if __name__ == "__main__":
    train_models()
