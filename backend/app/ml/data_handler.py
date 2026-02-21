import pandas as pd
import numpy as np
from pathlib import Path
from loguru import logger
from app.core.config import settings

class DataHandler:
    """Handles data loading and basic operations"""
    
    @staticmethod
    def load_csv(filepath: str | Path) -> pd.DataFrame:
        """Load CSV file"""
        logger.info(f"Loading data from {filepath}")
        df = pd.read_csv(filepath, sep=';' if str(filepath).endswith('.csv') else ',')
        # Try semicolon separator if comma doesn't work well
        if len(df.columns) == 1:
            df = pd.read_csv(filepath, sep=';')
        logger.info(f"Loaded {len(df)} records with {len(df.columns)} features")
        return df
    
    @staticmethod
    def save_csv(df: pd.DataFrame, filepath: str | Path) -> None:
        """Save DataFrame to CSV"""
        df.to_csv(filepath, index=False)
        logger.info(f"Saved data to {filepath}")
    
    @staticmethod
    def get_sample_data() -> pd.DataFrame:
        """Generate sample cardiovascular data for testing"""
        np.random.seed(settings.RANDOM_STATE)
        n_samples = 1000
        
        data = {
            'age': np.random.randint(30, 70, n_samples) * 365,  # Age in days
            'gender': np.random.choice([1, 2], n_samples),
            'height': np.random.randint(150, 195, n_samples),
            'weight': np.random.randint(50, 120, n_samples),
            'ap_hi': np.random.randint(90, 180, n_samples),
            'ap_lo': np.random.randint(60, 120, n_samples),
            'cholesterol': np.random.choice([1, 2, 3], n_samples),
            'gluc': np.random.choice([1, 2, 3], n_samples),
            'smoke': np.random.choice([0, 1], n_samples, p=[0.85, 0.15]),
            'alco': np.random.choice([0, 1], n_samples, p=[0.9, 0.1]),
            'active': np.random.choice([0, 1], n_samples, p=[0.2, 0.8]),
        }
        
        df = pd.DataFrame(data)
        # Generate target based on risk factors
        risk_score = (
            (df['ap_hi'] > 140).astype(int) * 0.3 +
            (df['cholesterol'] > 1).astype(int) * 0.2 +
            (df['age'] / 365 > 55).astype(int) * 0.2 +
            df['smoke'] * 0.15 +
            (1 - df['active']) * 0.1 +
            df['alco'] * 0.05
        )
        df['cardio'] = (risk_score > 0.4 + np.random.uniform(-0.2, 0.2, n_samples)).astype(int)
        
        return df
