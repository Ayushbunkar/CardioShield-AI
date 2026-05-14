import { useState, useCallback } from 'react';
import { predictFull, saveAssessment } from '../services/cardioApi';
import toast from 'react-hot-toast';

/**
 * usePredict - Custom hook for AI cardiovascular risk prediction
 * 
 * Handles:
 * - Form validation
 * - API prediction calls
 * - Explanation fetching
 * - Assessment saving
 * - Loading/error states
 */

const usePredict = (isLoggedIn = false) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [error, setError] = useState(null);
  const [patientData, setPatientData] = useState(null);

  /**
   * Validate form data before submission
   */
  const validateFormData = useCallback((data) => {
    const errors = {};

    // Age validation
    if (!data.age || data.age < 18 || data.age > 100) {
      errors.age = 'Age must be between 18 and 100 years';
    }

    // Height validation
    if (!data.height || data.height < 100 || data.height > 250) {
      errors.height = 'Height must be between 100 and 250 cm';
    }

    // Weight validation
    if (!data.weight || data.weight < 30 || data.weight > 300) {
      errors.weight = 'Weight must be between 30 and 300 kg';
    }

    // Blood pressure validation
    if (!data.ap_hi || data.ap_hi < 70 || data.ap_hi > 250) {
      errors.ap_hi = 'Systolic BP must be between 70 and 250 mmHg';
    }

    if (!data.ap_lo || data.ap_lo < 40 || data.ap_lo > 180) {
      errors.ap_lo = 'Diastolic BP must be between 40 and 180 mmHg';
    }

    // Diastolic must be less than systolic
    if (data.ap_lo >= data.ap_hi) {
      errors.ap_lo = 'Diastolic BP must be lower than Systolic BP';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, []);

  /**
   * Submit form for prediction
   */
  const predict = useCallback(async (formData) => {
    setIsLoading(true);
    setError(null);
    setPatientData(formData);

    try {
      // Validate form data
      const validation = validateFormData(formData);
      if (!validation.isValid) {
        setError(validation.errors);
        toast.error('Please fix the form errors');
        return { success: false, errors: validation.errors };
      }

      // Call prediction API (Combined predict + explain for speed)
      const { result: predResult, explanation: explainResult } = await predictFull(formData);
      setResult(predResult);
      setExplanation(explainResult);

      toast.success(`Assessment complete: ${predResult.risk_level} Risk`);
      
      return { success: true, result: predResult };

    } catch (err) {
      console.error('Prediction error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to get prediction. Is the AI backend running?';
      toast.error(errorMessage);
      setError({ general: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [validateFormData]);

  /**
   * Save assessment to user history
   */
  const save = useCallback(async () => {
    if (!result || !patientData) {
      toast.error('No assessment to save');
      return { success: false };
    }

    if (!isLoggedIn) {
      toast.error('Please login to save assessments');
      return { success: false };
    }

    setIsSaving(true);

    try {
      await saveAssessment({
        patientData,
        riskScore: result.risk_score,
        riskLevel: result.risk_level,
        prediction: result.prediction,
        confidence: result.confidence,
        recommendations: result.recommendations,
      });

      toast.success('Assessment saved successfully!');
      return { success: true };
    } catch (err) {
      console.error('Save error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save assessment';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSaving(false);
    }
  }, [result, patientData, isLoggedIn]);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setResult(null);
    setExplanation(null);
    setError(null);
    setPatientData(null);
  }, []);

  return {
    // State
    isLoading,
    isSaving,
    result,
    explanation,
    error,
    patientData,
    
    // Actions
    predict,
    save,
    reset,
    validateFormData,
    
    // Derived
    hasResult: !!result,
  };
};

export default usePredict;
