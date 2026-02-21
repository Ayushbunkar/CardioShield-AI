import numpy as np
from sklearn.calibration import CalibratedClassifierCV
from sklearn.isotonic import IsotonicRegression
from loguru import logger

class ModelCalibrator:
    """Probability calibration using Platt scaling or Isotonic regression"""
    
    def __init__(self, method: str = 'isotonic'):
        """
        Args:
            method: 'platt' for Platt scaling, 'isotonic' for Isotonic regression
        """
        self.method = method
        self.calibrator = None
        self.is_fitted = False
    
    def fit(self, y_true: np.ndarray, y_proba: np.ndarray) -> None:
        """Fit the calibrator"""
        if self.method == 'isotonic':
            self.calibrator = IsotonicRegression(out_of_bounds='clip')
            self.calibrator.fit(y_proba, y_true)
        else:
            # Simple Platt scaling parameters
            from scipy.optimize import minimize
            def platt_loss(params):
                a, b = params
                p = 1 / (1 + np.exp(-(a * y_proba + b)))
                return -np.mean(y_true * np.log(p + 1e-10) + (1 - y_true) * np.log(1 - p + 1e-10))
            
            result = minimize(platt_loss, [1, 0], method='BFGS')
            self.calibrator = result.x
        
        self.is_fitted = True
        logger.info(f"Calibrator fitted using {self.method} method")
    
    def calibrate(self, y_proba: np.ndarray) -> np.ndarray:
        """Calibrate probabilities"""
        if not self.is_fitted:
            return y_proba
        
        if self.method == 'isotonic':
            return self.calibrator.predict(y_proba)
        else:
            a, b = self.calibrator
            return 1 / (1 + np.exp(-(a * y_proba + b)))


class CalibratedModel:
    """Wrapper for calibrated predictions"""
    
    def __init__(self, model, calibrator: ModelCalibrator = None):
        self.model = model
        self.calibrator = calibrator or ModelCalibrator()
    
    def fit_calibrator(self, X: np.ndarray, y: np.ndarray) -> None:
        """Fit calibrator on validation data"""
        y_proba = self.model.predict_proba(X)
        self.calibrator.fit(y, y_proba)
    
    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Get calibrated probabilities"""
        raw_proba = self.model.predict_proba(X)
        return self.calibrator.calibrate(raw_proba)
