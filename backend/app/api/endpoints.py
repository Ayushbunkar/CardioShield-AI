from fastapi import APIRouter, Depends, HTTPException
from loguru import logger
import numpy as np

from app.api.schemas import (
    PatientData, PredictionResponse, ExplanationResponse,
    MetricsResponse, FairnessResponse, HealthResponse, FeatureImpact
)
from app.api.dependencies import ModelService, get_model_service
from app.ml.explainability import ExplanationGenerator
from app.core.config import settings

router = APIRouter()

@router.post("/predict", response_model=PredictionResponse)
async def predict(
    patient: PatientData,
    service: ModelService = Depends(get_model_service)
):
    """Predict cardiovascular risk for a patient"""
    if not service.model or not service.model.is_trained:
        raise HTTPException(status_code=503, detail="Model not ready")
    
    try:
        # Preprocess input
        data = patient.model_dump()
        X = service.preprocess_input(data)
        
        # Predict
        risk_score = float(service.model.predict_proba(X)[0])
        prediction = int(risk_score >= service.model.threshold)
        risk_level = service.get_risk_level(risk_score)
        
        # Calculate confidence
        confidence = abs(risk_score - 0.5) * 2
        
        # Get recommendations
        recommendations = service.get_recommendations(data, risk_level)
        
        logger.info(f"Prediction: {risk_level} ({risk_score:.2f})")
        
        return PredictionResponse(
            risk_score=risk_score,
            risk_level=risk_level,
            prediction=prediction,
            confidence=confidence,
            recommendations=recommendations
        )
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/explain", response_model=ExplanationResponse)
async def explain(
    patient: PatientData,
    service: ModelService = Depends(get_model_service)
):
    """Get SHAP-based explanation for prediction"""
    if not service.explainer:
        raise HTTPException(status_code=503, detail="Explainer not ready")
    
    try:
        data = patient.model_dump()
        X = service.preprocess_input(data)
        
        # Get SHAP values
        explanation = service.explainer.explain(X)
        shap_values = np.array(explanation['shap_values']).flatten()
        
        # Generate human-readable explanations
        feature_impacts = ExplanationGenerator.generate_explanation(
            shap_values,
            service.model.feature_names,
            X.flatten()
        )
        
        return ExplanationResponse(
            shap_values=shap_values.tolist(),
            base_value=explanation['base_value'],
            feature_impacts=[FeatureImpact(**f) for f in feature_impacts],
            feature_importance=service.model.get_feature_importance()
        )
    except Exception as e:
        logger.error(f"Explanation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics", response_model=MetricsResponse)
async def get_metrics(service: ModelService = Depends(get_model_service)):
    """Get model performance metrics"""
    if not service.model or not service.model.metrics:
        raise HTTPException(status_code=503, detail="Model not ready")
    
    return MetricsResponse(**service.model.metrics)

@router.get("/fairness", response_model=FairnessResponse)
async def get_fairness(service: ModelService = Depends(get_model_service)):
    """Get fairness analysis across demographic groups"""
    if not service.fairness_analyzer or service.X_train is None:
        raise HTTPException(status_code=503, detail="Fairness analyzer not ready")
    
    try:
        report = service.fairness_analyzer.full_fairness_report(
            service.X_train, service.y_train
        )
        return FairnessResponse(**report)
    except Exception as e:
        logger.error(f"Fairness analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health", response_model=HealthResponse)
async def health_check(service: ModelService = Depends(get_model_service)):
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        model_loaded=service.model is not None and service.model.is_trained,
        version=settings.VERSION
    )
