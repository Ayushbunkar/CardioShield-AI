import numpy as np
import pandas as pd
from pathlib import Path
from loguru import logger
from app.core.config import settings
from app.ml.data_handler import DataHandler
from app.ml.preprocessing import DataPreprocessor
from app.ml.feature_engineering import FeatureEngineer, FeatureSelector
from app.ml.models import CardioShieldModel
from app.ml.explainability import SHAPExplainer, ExplanationGenerator
from app.ml.fairness import FairnessAnalyzer

class ModelService:
    """Singleton service for model operations"""
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        self.model: CardioShieldModel = None
        self.preprocessor: DataPreprocessor = None
        self.explainer: SHAPExplainer = None
        self.fairness_analyzer: FairnessAnalyzer = None
        self.X_train: np.ndarray = None
        self.y_train: np.ndarray = None
        self._initialized = True
    
    async def initialize(self) -> None:
        """Initialize and train model"""
        logger.info("Initializing ModelService...")
        
        model_path = settings.MODELS_DIR / "cardio_model.pkl"
        
        if model_path.exists():
            # Load existing model
            self.model = CardioShieldModel()
            self.model.load(str(model_path))
            self.preprocessor = DataPreprocessor()
            
            # Load training data for explainability
            data_path = settings.DATA_DIR / "cardio_train.csv"
            if data_path.exists():
                df = DataHandler.load_csv(data_path)
                df = FeatureEngineer.create_features(df)
                X = FeatureSelector.select_features(df)
                self.X_train = self.preprocessor.fit_transform(X)
                self.y_train = df['cardio'].values if 'cardio' in df.columns else None
        else:
            # Train new model
            await self._train_model()
        
        # Initialize explainer
        if self.model and self.model.is_trained:
            self.explainer = SHAPExplainer(self.model.model, self.model.feature_names)
            self.explainer.initialize(self.X_train)
            
            if self.X_train is not None and self.y_train is not None:
                self.fairness_analyzer = FairnessAnalyzer(self.model, self.model.feature_names)
        
        logger.info("ModelService initialized successfully")
    
    async def _train_model(self) -> None:
        """Train a new model"""
        # Load or generate data
        data_path = settings.DATA_DIR / "cardio_train.csv"
        
        if data_path.exists():
            df = DataHandler.load_csv(data_path)
        else:
            logger.info("No training data found, using sample data")
            df = DataHandler.get_sample_data()
            DataHandler.save_csv(df, data_path)
        
        # Preprocess
        self.preprocessor = DataPreprocessor()
        df = self.preprocessor.clean_data(df)
        
        # Feature engineering
        df = FeatureEngineer.create_features(df)
        
        # Select features
        X_df = FeatureSelector.select_features(df)
        y = df['cardio'].values
        
        # Scale features
        self.X_train = self.preprocessor.fit_transform(X_df)
        self.y_train = y
        
        # Train model
        self.model = CardioShieldModel()
        self.model.train(self.X_train, self.y_train, X_df.columns.tolist())
        
        # Save model
        self.model.save(str(settings.MODELS_DIR / "cardio_model.pkl"))
    
    def preprocess_input(self, data: dict) -> np.ndarray:
        """Preprocess single patient input"""
        df = pd.DataFrame([data])
        df = FeatureEngineer.create_features(df)
        X = FeatureSelector.select_features(df)
        return self.preprocessor.transform(X)
    
    def get_risk_level(self, score: float) -> str:
        """Convert score to risk level"""
        if score < 0.25:
            return "Low"
        elif score < 0.5:
            return "Moderate"
        elif score < 0.75:
            return "High"
        return "Very High"
    
    def get_recommendations(self, data: dict, risk_level: str) -> list:
        """Generate health recommendations"""
        recs = []
        
        if data.get('ap_hi', 0) > 140:
            recs.append("Monitor and manage blood pressure regularly")
        if data.get('cholesterol', 1) > 1:
            recs.append("Consider dietary changes to lower cholesterol")
        if data.get('smoke', 0) == 1:
            recs.append("Quit smoking to significantly reduce cardiovascular risk")
        if data.get('active', 1) == 0:
            recs.append("Increase physical activity to at least 150 min/week")
        if data.get('alco', 0) == 1:
            recs.append("Limit alcohol consumption")
        
        bmi = data.get('weight', 70) / ((data.get('height', 170) / 100) ** 2)
        if bmi > 30:
            recs.append("Work towards a healthy BMI through diet and exercise")
        
        if not recs:
            recs.append("Maintain your healthy lifestyle habits")
        
        return recs

# Dependency injection
def get_model_service() -> ModelService:
    return ModelService()
