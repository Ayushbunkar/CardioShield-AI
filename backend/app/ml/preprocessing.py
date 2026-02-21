import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from loguru import logger

class DataPreprocessor:
    """Data cleaning and preprocessing"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.feature_names = []
        self.is_fitted = False
    
    def clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and validate data"""
        df = df.copy()
        
        # Convert age from days to years if needed
        if df['age'].mean() > 100:
            df['age'] = df['age'] / 365
        
        # Remove outliers
        df = df[(df['ap_hi'] > 60) & (df['ap_hi'] < 250)]
        df = df[(df['ap_lo'] > 40) & (df['ap_lo'] < 200)]
        df = df[(df['height'] > 100) & (df['height'] < 220)]
        df = df[(df['weight'] > 30) & (df['weight'] < 200)]
        df = df[df['ap_hi'] > df['ap_lo']]
        
        logger.info(f"Cleaned data: {len(df)} records remaining")
        return df.reset_index(drop=True)
    
    def fit_transform(self, X: pd.DataFrame) -> np.ndarray:
        """Fit scaler and transform features"""
        self.feature_names = X.columns.tolist()
        self.is_fitted = True
        return self.scaler.fit_transform(X)
    
    def transform(self, X: pd.DataFrame) -> np.ndarray:
        """Transform features using fitted scaler"""
        if not self.is_fitted:
            raise ValueError("Preprocessor not fitted. Call fit_transform first.")
        return self.scaler.transform(X)
    
    def get_feature_names(self) -> list:
        """Get feature names"""
        return self.feature_names
