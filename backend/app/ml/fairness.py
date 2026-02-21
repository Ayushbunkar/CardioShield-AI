import numpy as np
import pandas as pd
from sklearn.metrics import roc_auc_score, f1_score
from loguru import logger

class FairnessAnalyzer:
    """Analyze model fairness across demographic groups"""
    
    def __init__(self, model, feature_names: list):
        self.model = model
        self.feature_names = feature_names
    
    def analyze_by_group(self, X: np.ndarray, y: np.ndarray, group_feature: str) -> dict:
        """Analyze performance by demographic group"""
        if group_feature not in self.feature_names:
            return {'error': f'Feature {group_feature} not found'}
        
        idx = self.feature_names.index(group_feature)
        groups = np.unique(X[:, idx])
        
        results = {'feature': group_feature, 'groups': []}
        
        for group in groups:
            mask = X[:, idx] == group
            if mask.sum() < 10:
                continue
            
            X_group, y_group = X[mask], y[mask]
            y_proba = self.model.predict_proba(X_group)
            y_pred = self.model.predict(X_group)
            
            try:
                auc = roc_auc_score(y_group, y_proba)
            except:
                auc = 0.5
            
            results['groups'].append({
                'group': int(group),
                'group_label': self._get_group_label(group_feature, group),
                'count': int(mask.sum()),
                'positive_rate': float(y_group.mean()),
                'predicted_positive_rate': float(y_pred.mean()),
                'auc': float(auc),
                'f1': float(f1_score(y_group, y_pred, zero_division=0))
            })
        
        # Calculate disparities
        if len(results['groups']) >= 2:
            aucs = [g['auc'] for g in results['groups']]
            pprs = [g['predicted_positive_rate'] for g in results['groups']]
            results['auc_disparity'] = max(aucs) - min(aucs)
            results['demographic_parity_diff'] = max(pprs) - min(pprs)
        
        return results
    
    def _get_group_label(self, feature: str, value: int) -> str:
        """Get human-readable group label"""
        labels = {
            'gender': {1: 'Female', 2: 'Male'},
            'cholesterol': {1: 'Normal', 2: 'Above Normal', 3: 'High'},
            'gluc': {1: 'Normal', 2: 'Above Normal', 3: 'High'},
            'smoke': {0: 'Non-smoker', 1: 'Smoker'},
            'alco': {0: 'No alcohol', 1: 'Alcohol'},
            'active': {0: 'Inactive', 1: 'Active'}
        }
        return labels.get(feature, {}).get(int(value), str(value))
    
    def full_fairness_report(self, X: np.ndarray, y: np.ndarray) -> dict:
        """Generate complete fairness report"""
        report = {
            'analyses': [],
            'summary': {}
        }
        
        # Analyze by key demographic features
        for feature in ['gender', 'age', 'cholesterol']:
            if feature in self.feature_names:
                if feature == 'age':
                    # Bin age into groups
                    idx = self.feature_names.index(feature)
                    X_binned = X.copy()
                    X_binned[:, idx] = np.digitize(X[:, idx], bins=[40, 50, 60])
                    analysis = self.analyze_by_group(X_binned, y, feature)
                    analysis['groups'] = [
                        {**g, 'group_label': ['<40', '40-50', '50-60', '>60'][g['group']]}
                        for g in analysis.get('groups', [])
                    ]
                else:
                    analysis = self.analyze_by_group(X, y, feature)
                report['analyses'].append(analysis)
        
        # Summary metrics
        if report['analyses']:
            disparities = [a.get('auc_disparity', 0) for a in report['analyses'] if 'auc_disparity' in a]
            report['summary']['max_auc_disparity'] = max(disparities) if disparities else 0
            report['summary']['fairness_score'] = 1 - report['summary']['max_auc_disparity']
        
        return report
