import pandas as pd
import numpy as np
from loguru import logger

class FeatureEngineer:
    """Create derived features"""
    
    @staticmethod
    def create_features(df: pd.DataFrame) -> pd.DataFrame:
        """Generate all derived features"""
        df = df.copy()
        
        # Convert age to years if in days
        if 'age' in df.columns and df['age'].mean() > 100:
            df['age'] = df['age'] / 365
        
        # Pulse pressure
        df['pulse_pressure'] = df['ap_hi'] - df['ap_lo']
        
        # Mean arterial pressure
        df['map'] = (df['ap_hi'] + 2 * df['ap_lo']) / 3
        
        # BMI
        df['bmi'] = df['weight'] / ((df['height'] / 100) ** 2)
        
        # BMI category: 0=Normal, 1=Overweight, 2=Obese
        df['bmi_category'] = pd.cut(
            df['bmi'],
            bins=[0, 25, 30, 100],
            labels=[0, 1, 2]
        ).astype(int)
        
        # Age-SBP interaction
        df['age_sbp_interaction'] = df['age'] * df['ap_hi'] / 100
        
        # Metabolic risk score
        df['metabolic_risk'] = (
            (df['cholesterol'] - 1) +
            (df['gluc'] - 1) +
            df['smoke'] +
            df['alco'] +
            (1 - df['active'])
        ) / 5
        
        # Blood pressure category
        df['bp_category'] = np.where(
            df['ap_hi'] < 120, 0,  # Normal
            np.where(df['ap_hi'] < 140, 1,  # Elevated
            np.where(df['ap_hi'] < 160, 2, 3))  # High/Very High
        )
        
        logger.info(f"Created {8} derived features")
        return df


class FeatureSelector:
    """Select important features"""
    
    BASE_FEATURES = ['age', 'gender', 'height', 'weight', 'ap_hi', 'ap_lo', 
                     'cholesterol', 'gluc', 'smoke', 'alco', 'active']
    
    DERIVED_FEATURES = ['pulse_pressure', 'map', 'bmi', 'bmi_category',
                        'age_sbp_interaction', 'metabolic_risk', 'bp_category']
    
    @classmethod
    def get_all_features(cls) -> list:
        """Get all feature names"""
        return cls.BASE_FEATURES + cls.DERIVED_FEATURES
    
    @classmethod
    def select_features(cls, df: pd.DataFrame, include_derived: bool = True) -> pd.DataFrame:
        """Select features for model"""
        features = cls.BASE_FEATURES.copy()
        if include_derived:
            features.extend(cls.DERIVED_FEATURES)
        return df[[f for f in features if f in df.columns]]
