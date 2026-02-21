import numpy as np
import shap
from loguru import logger

class SHAPExplainer:
    """SHAP-based model explainability"""
    
    def __init__(self, model, feature_names: list = None):
        self.model = model
        self.feature_names = feature_names or []
        self.explainer = None
    
    def initialize(self, X_background: np.ndarray = None) -> None:
        """Initialize SHAP explainer"""
        try:
            self.explainer = shap.TreeExplainer(self.model)
            logger.info("SHAP TreeExplainer initialized")
        except Exception as e:
            logger.warning(f"TreeExplainer failed, using KernelExplainer: {e}")
            if X_background is not None:
                self.explainer = shap.KernelExplainer(self.model.predict_proba, X_background[:100])
    
    def explain(self, X: np.ndarray) -> dict:
        """Generate SHAP explanations"""
        if self.explainer is None:
            return {}
        
        shap_values = self.explainer.shap_values(X)
        
        # Handle multi-output SHAP values
        if isinstance(shap_values, list):
            shap_values = shap_values[1]  # Take positive class
        
        return {
            'shap_values': shap_values.tolist() if hasattr(shap_values, 'tolist') else shap_values,
            'base_value': float(self.explainer.expected_value[1]) if hasattr(self.explainer.expected_value, '__iter__') else float(self.explainer.expected_value),
            'feature_names': self.feature_names
        }


class ExplanationGenerator:
    """Generate human-readable explanations"""
    
    FEATURE_DESCRIPTIONS = {
        'age': 'Patient age',
        'gender': 'Gender',
        'ap_hi': 'Systolic blood pressure',
        'ap_lo': 'Diastolic blood pressure',
        'cholesterol': 'Cholesterol level',
        'gluc': 'Glucose level',
        'smoke': 'Smoking status',
        'alco': 'Alcohol consumption',
        'active': 'Physical activity',
        'bmi': 'Body Mass Index',
        'pulse_pressure': 'Pulse pressure',
        'map': 'Mean arterial pressure',
        'metabolic_risk': 'Metabolic risk score',
        'bp_category': 'Blood pressure category'
    }
    
    @classmethod
    def generate_explanation(cls, shap_values: np.ndarray, feature_names: list, feature_values: np.ndarray) -> list:
        """Generate feature impact explanations"""
        explanations = []
        
        # Sort by absolute SHAP value
        indices = np.argsort(np.abs(shap_values))[::-1]
        
        for idx in indices[:5]:  # Top 5 features
            name = feature_names[idx]
            value = feature_values[idx]
            impact = shap_values[idx]
            
            desc = cls.FEATURE_DESCRIPTIONS.get(name, name)
            direction = "increases" if impact > 0 else "decreases"
            
            explanations.append({
                'feature': name,
                'description': desc,
                'value': float(value),
                'impact': float(impact),
                'direction': direction,
                'text': f"{desc} ({value:.1f}) {direction} risk by {abs(impact):.3f}"
            })
        
        return explanations
