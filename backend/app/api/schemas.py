from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class PatientData(BaseModel):
    """Input patient data for prediction"""
    age: int = Field(..., ge=1, le=120, description="Age in years")
    gender: int = Field(..., ge=1, le=2, description="1=Female, 2=Male")
    height: int = Field(..., ge=100, le=220, description="Height in cm")
    weight: int = Field(..., ge=30, le=200, description="Weight in kg")
    ap_hi: int = Field(..., ge=60, le=250, description="Systolic blood pressure")
    ap_lo: int = Field(..., ge=40, le=200, description="Diastolic blood pressure")
    cholesterol: int = Field(..., ge=1, le=3, description="1=Normal, 2=Above, 3=High")
    gluc: int = Field(..., ge=1, le=3, description="1=Normal, 2=Above, 3=High")
    smoke: int = Field(..., ge=0, le=1, description="0=No, 1=Yes")
    alco: int = Field(..., ge=0, le=1, description="0=No, 1=Yes")
    active: int = Field(..., ge=0, le=1, description="0=No, 1=Yes")

    class Config:
        json_schema_extra = {
            "example": {
                "age": 55, "gender": 1, "height": 165, "weight": 70,
                "ap_hi": 130, "ap_lo": 85, "cholesterol": 2, "gluc": 1,
                "smoke": 0, "alco": 0, "active": 1
            }
        }

class PredictionResponse(BaseModel):
    """Prediction result"""
    risk_score: float = Field(..., description="Risk probability (0-1)")
    risk_level: str = Field(..., description="Low/Moderate/High/Very High")
    prediction: int = Field(..., description="0=Low risk, 1=High risk")
    confidence: float = Field(..., description="Model confidence")
    recommendations: List[str] = Field(default=[], description="Health recommendations")

class FeatureImpact(BaseModel):
    """Feature impact explanation"""
    feature: str
    description: str
    value: float
    impact: float
    direction: str
    text: str

class ExplanationResponse(BaseModel):
    """SHAP explanation response"""
    shap_values: List[float]
    base_value: float
    feature_impacts: List[FeatureImpact]
    feature_importance: Dict[str, float]

class MetricsResponse(BaseModel):
    """Model metrics"""
    accuracy: float
    precision: float
    recall: float
    f1: float
    auc: float
    threshold: float

class GroupAnalysis(BaseModel):
    """Fairness analysis for a group"""
    group: int
    group_label: str
    count: int
    positive_rate: float
    predicted_positive_rate: float
    auc: float
    f1: float

class FairnessAnalysis(BaseModel):
    """Fairness analysis result"""
    feature: str
    groups: List[GroupAnalysis]
    auc_disparity: Optional[float] = None
    demographic_parity_diff: Optional[float] = None

class FairnessResponse(BaseModel):
    """Full fairness report"""
    analyses: List[FairnessAnalysis]
    summary: Dict[str, float]

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    model_loaded: bool
    version: str
