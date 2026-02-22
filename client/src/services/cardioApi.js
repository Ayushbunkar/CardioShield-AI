/**
 * CardioShield AI - API Service
 * ==============================
 * Client API for heart disease prediction and user management.
 */

import axios from 'axios';

// =============================================================================
// API CLIENTS
// =============================================================================

const AI_API = '/api';
const SERVER_API = 'http://localhost:4500';

const aiClient = axios.create({
  baseURL: AI_API,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

const serverClient = axios.create({
  baseURL: SERVER_API,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// =============================================================================
// HELPER: Convert form data to model input array
// =============================================================================

const toInputArray = (p) => [
  p.age, p.sex, p.cp, p.trestbps, p.chol, p.fbs,
  p.restecg, p.thalach, p.exang, p.oldpeak, p.slope, p.ca, p.thal
];

// =============================================================================
// AI PREDICTION APIs
// =============================================================================

/**
 * Quick prediction using LightGBM model.
 * @param {Object} patientData - Patient form data
 * @returns {Object} Prediction result with risk level and recommendations
 */
export const predictRisk = async (patientData) => {
  const { data } = await aiClient.post('/predict', { input: toInputArray(patientData) });
  
  return {
    prediction: data.prediction,
    risk_score: data.probability.disease,
    risk_level: data.risk_level,
    confidence: data.confidence,
    probability: data.probability,
    feature_importance: data.feature_importance,
    recommendations: generateRecommendations(patientData, data)
  };
};

/**
 * Full AI assessment with detailed analysis.
 * @param {Object} patientData - Patient form data
 * @returns {Object} Complete assessment with risk factors and recommendations
 */
export const comprehensiveAssessment = async (patientData) => {
  const { data } = await aiClient.post('/assess', {
    input: toInputArray(patientData),
    patientData
  });
  return data;
};

/**
 * Get feature importance explanation.
 * @param {Object} patientData - Patient form data
 * @returns {Object} Feature importance and risk interpretation
 */
export const getExplanation = async (patientData) => {
  const importance = calculateImportance(patientData);
  const risks = identifyRisks(patientData);
  
  return {
    feature_importance: importance,
    top_risk_factors: Object.entries(importance)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, impact]) => ({ name, impact })),
    interpretation: risks.length > 0
      ? `Risk factors: ${risks.join(', ')}. Consult a healthcare provider.`
      : 'Health indicators are within normal ranges.'
  };
};

/** Get model metrics */
export const getMetrics = async () => (await aiClient.get('/metrics')).data;

/** Get fairness analysis */
export const getFairness = async () => (await aiClient.get('/fairness')).data;

/** Health check */
export const checkHealth = async () => (await aiClient.get('/health')).data;

// =============================================================================
// USER ASSESSMENT APIs
// =============================================================================

export const saveAssessment = async (data) => 
  (await serverClient.post('/assessment/save', data)).data;

export const getAssessmentHistory = async (page = 1, limit = 10) =>
  (await serverClient.get(`/assessment/history?page=${page}&limit=${limit}`)).data;

export const getLatestAssessment = async () =>
  (await serverClient.get('/assessment/latest')).data;

export const getUserStats = async () =>
  (await serverClient.get('/assessment/stats')).data;

export const getUserMessages = async () =>
  (await serverClient.get('/assessment/messages')).data;

export const markMessageAsRead = async (id) =>
  (await serverClient.put(`/assessment/messages/${id}/read`)).data;

// =============================================================================
// ADMIN APIs
// =============================================================================

export const getAIDashboardStats = async () =>
  (await serverClient.get('/admin/ai/dashboard')).data;

export const getAllAssessments = async (page = 1, limit = 20) =>
  (await serverClient.get(`/admin/ai/assessments?page=${page}&limit=${limit}`)).data;

export const getHighRiskUsers = async () =>
  (await serverClient.get('/admin/ai/high-risk')).data;

export const getUserAssessmentHistory = async (userId) =>
  (await serverClient.get(`/admin/ai/user/${userId}/history`)).data;

export const sendMessageToUser = async (data) =>
  (await serverClient.post('/admin/ai/message', data)).data;

export const getAdminMessages = async () =>
  (await serverClient.get('/admin/ai/messages')).data;

// =============================================================================
// GUEST USAGE TRACKING
// =============================================================================

const GUEST_KEY = 'cardio_guest_usage';
const MAX_GUEST = 3;

export const getGuestUsageCount = () => 
  parseInt(localStorage.getItem(GUEST_KEY) || '0', 10);

export const incrementGuestUsage = () => {
  const count = getGuestUsageCount() + 1;
  localStorage.setItem(GUEST_KEY, count.toString());
  return count;
};

export const canGuestUse = () => getGuestUsageCount() < MAX_GUEST;

export const getRemainingGuestAttempts = () => 
  Math.max(0, MAX_GUEST - getGuestUsageCount());

// =============================================================================
// HELPERS (Internal)
// =============================================================================

function generateRecommendations(patient, result) {
  const recs = [];
  
  if (result.prediction === 1 || ['High', 'Very High'].includes(result.risk_level)) {
    recs.push('Schedule an appointment with a cardiologist immediately');
  }
  if (patient.trestbps > 140) {
    recs.push('Monitor blood pressure regularly');
  }
  if (patient.chol > 240) {
    recs.push('Consider cholesterol-lowering dietary changes');
  }
  if (patient.fbs === 1) {
    recs.push('Manage blood sugar through diet and exercise');
  }
  if (patient.exang === 1) {
    recs.push('Avoid strenuous exercise until cleared by doctor');
  }
  
  return recs.length > 0 ? recs : [
    'Maintain a healthy lifestyle with regular exercise',
    'Continue regular health checkups',
    'Follow a heart-healthy diet'
  ];
}

function calculateImportance(p) {
  return {
    'Chest Pain': p.cp >= 3 ? 0.25 : 0.12,
    'Exercise Angina': p.exang === 1 ? 0.10 : 0.03,
    'Cholesterol': p.chol > 240 ? 0.09 : 0.04,
    'ST Depression': p.oldpeak > 2 ? 0.08 : 0.03,
    'Blood Pressure': p.trestbps > 140 ? 0.07 : 0.03,
    'Age': p.age > 55 ? 0.06 : 0.03,
    'Vessels': p.ca > 0 ? 0.06 : 0.02,
    'Thalassemia': p.thal === 7 ? 0.05 : 0.02,
    'Max Heart Rate': p.thalach < 120 ? 0.05 : 0.02,
    'Blood Sugar': p.fbs === 1 ? 0.04 : 0.02,
    'Sex': p.sex === 1 ? 0.04 : 0.02,
    'ST Slope': p.slope === 3 ? 0.03 : 0.02,
    'ECG': p.restecg > 0 ? 0.03 : 0.01
  };
}

function identifyRisks(p) {
  const risks = [];
  if (p.cp >= 3) risks.push('Significant chest pain');
  if (p.exang === 1) risks.push('Exercise-induced angina');
  if (p.chol > 240) risks.push('High cholesterol');
  if (p.ca > 0) risks.push('Vessel abnormalities');
  if (p.thal === 7) risks.push('Thalassemia defect');
  if (p.oldpeak > 2) risks.push('ST depression');
  return risks;
}

export default aiClient;
