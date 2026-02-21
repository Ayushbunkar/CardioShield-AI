import numpy as np
import pandas as pd
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import roc_auc_score, f1_score, precision_score, recall_score, accuracy_score
from loguru import logger
from app.core.config import settings
import joblib

class ClassImbalanceHandler:
    """Handle class imbalance using class weights"""
    
    @staticmethod
    def get_scale_pos_weight(y: np.ndarray) -> float:
        """Calculate scale_pos_weight for XGBoost"""
        neg_count = np.sum(y == 0)
        pos_count = np.sum(y == 1)
        return neg_count / pos_count if pos_count > 0 else 1.0


class ThresholdOptimizer:
    """Optimize decision threshold for best F1 score"""
    
    @staticmethod
    def find_optimal_threshold(y_true: np.ndarray, y_proba: np.ndarray) -> float:
        """Find threshold that maximizes F1 score"""
        best_threshold, best_f1 = 0.5, 0
        for threshold in np.arange(0.3, 0.7, 0.01):
            y_pred = (y_proba >= threshold).astype(int)
            f1 = f1_score(y_true, y_pred)
            if f1 > best_f1:
                best_f1, best_threshold = f1, threshold
        logger.info(f"Optimal threshold: {best_threshold:.2f} (F1: {best_f1:.3f})")
        return best_threshold


class CardioShieldModel:
    """XGBoost model for cardiovascular risk prediction"""
    
    def __init__(self):
        self.model = None
        self.threshold = 0.5
        self.feature_names = []
        self.metrics = {}
        self.is_trained = False
    
    def train(self, X: np.ndarray, y: np.ndarray, feature_names: list = None) -> dict:
        """Train the model"""
        self.feature_names = feature_names or [f"f{i}" for i in range(X.shape[1])]
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=settings.TEST_SIZE, random_state=settings.RANDOM_STATE, stratify=y
        )
        
        # Calculate class weight
        scale_pos_weight = ClassImbalanceHandler.get_scale_pos_weight(y_train)
        
        # Create and train model
        self.model = XGBClassifier(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            scale_pos_weight=scale_pos_weight,
            random_state=settings.RANDOM_STATE,
            use_label_encoder=False,
            eval_metric='logloss'
        )
        
        self.model.fit(X_train, y_train)
        
        # Get predictions
        y_proba = self.model.predict_proba(X_test)[:, 1]
        
        # Optimize threshold
        self.threshold = ThresholdOptimizer.find_optimal_threshold(y_test, y_proba)
        y_pred = (y_proba >= self.threshold).astype(int)
        
        # Calculate metrics
        self.metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred),
            'recall': recall_score(y_test, y_pred),
            'f1': f1_score(y_test, y_pred),
            'auc': roc_auc_score(y_test, y_proba),
            'threshold': self.threshold
        }
        
        self.is_trained = True
        logger.info(f"Model trained - AUC: {self.metrics['auc']:.3f}, F1: {self.metrics['f1']:.3f}")
        return self.metrics
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Predict class labels"""
        proba = self.model.predict_proba(X)[:, 1]
        return (proba >= self.threshold).astype(int)
    
    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Predict probabilities"""
        return self.model.predict_proba(X)[:, 1]
    
    def get_feature_importance(self) -> dict:
        """Get feature importance scores"""
        importance = self.model.feature_importances_
        return dict(zip(self.feature_names, importance.tolist()))
    
    def save(self, filepath: str) -> None:
        """Save model to file"""
        joblib.dump({
            'model': self.model,
            'threshold': self.threshold,
            'feature_names': self.feature_names,
            'metrics': self.metrics
        }, filepath)
        logger.info(f"Model saved to {filepath}")
    
    def load(self, filepath: str) -> None:
        """Load model from file"""
        data = joblib.load(filepath)
        self.model = data['model']
        self.threshold = data['threshold']
        self.feature_names = data['feature_names']
        self.metrics = data['metrics']
        self.is_trained = True
        logger.info(f"Model loaded from {filepath}")
