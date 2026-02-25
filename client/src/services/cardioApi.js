/**
 * CardioShield AI - API Service
 * ==============================
 * Client API for heart disease prediction and user management.
 *
 * Architecture:
 *   - AI requests → Vite proxy (/api) → Flask (port 5001)
 *   - Server requests → Express (port 4500) → MongoDB
 *
 * All AI/ML logic lives in the Flask backend.
 * This file only handles API calls and response shaping.
 */

import axios from 'axios';

// =============================================================================
// API CLIENTS
// =============================================================================

/**
 * AI Flask backend client.
 * In dev: Vite proxies /api → http://localhost:5001 (see vite.config.js)
 * In prod: Set VITE_AI_API_URL to the deployed Flask URL.
 */
const AI_API = import.meta.env.VITE_AI_API_URL || '/api';

/**
 * Express backend client (auth, users, assessments, admin).
 * In dev: Direct to http://localhost:4500
 * In prod: Set VITE_SERVER_URL to the deployed Express URL.
 */
const SERVER_API = import.meta.env.VITE_SERVER_URL || 'http://localhost:4500';

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
  p.age, p.gender, p.height, p.weight, p.ap_hi, p.ap_lo,
  p.cholesterol, p.gluc, p.smoke, p.alco, p.active
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
  const { data } = await aiClient.post('/predict', { 
    input: toInputArray(patientData),
    patientData,
    consent: true,
  });
  
  return {
    prediction: data.prediction,
    risk_score: data.probability.disease,
    risk_level: data.risk_level,
    confidence: data.confidence,
    probability: data.probability,
    feature_importance: data.feature_importance,
    recommendations: data.recommendations || [],
    risk_factors: data.risk_factors || [],
    disclaimer: data.disclaimer,
    escalation: data.escalation,
    urgency: data.urgency,
    model_version: data.model_version,
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
  const { data } = await aiClient.post('/explain', { patientData });
  
  return {
    feature_importance: data.feature_importance,
    feature_impacts: data.feature_impacts || [],
    base_value: data.base_value || 0.497,
    shap: data.shap || null,
    plain_explanation: data.plain_explanation || null,
    narrative: data.narrative || '',
    risk_drivers: data.risk_factors || [],
    protective_factors: data.protective_factors || [],
    top_3_risk_drivers: data.top_3_risk_drivers || [],
    top_risk_factors: Object.entries(data.feature_importance)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, impact]) => ({ name, impact })),
    interpretation: data.narrative || (
      data.risk_factors?.length > 0
        ? `Risk factors: ${data.risk_factors.map(r => r.explanation || r).join(', ')}. Consult a healthcare provider.`
        : 'Health indicators are within normal ranges.'
    ),
    disclaimer: data.disclaimer,
  };
};

/** Get model metrics */
export const getMetrics = async () => (await aiClient.get('/metrics')).data;

/** Get fairness analysis */
export const getFairness = async () => (await aiClient.get('/fairness')).data;

/** Get bias mitigation before/after comparison */
export const getFairnessMitigation = async () => (await aiClient.get('/fairness/mitigation')).data;

/** Get global SHAP feature importance */
export const getGlobalExplanation = async () => (await aiClient.get('/explain/global')).data;

/** Get governance & compliance report */
export const getGovernanceReport = async () => (await aiClient.get('/governance')).data;

/** Get audit logs */
export const getAuditLogs = async (limit = 100) => (await aiClient.get(`/audit/logs?limit=${limit}`)).data;

/** Get audit summary */
export const getAuditSummary = async () => (await aiClient.get('/audit/summary')).data;

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

export const getAllAssessments = async (page = 1, limit = 20, riskLevel) => {
  let url = `/admin/ai/assessments?page=${page}&limit=${limit}`;
  if (riskLevel && riskLevel !== 'all') url += `&riskLevel=${riskLevel}`;
  return (await serverClient.get(url)).data;
};

export const getHighRiskUsers = async () =>
  (await serverClient.get('/admin/ai/high-risk')).data;

export const getUserAssessmentHistory = async (userId) =>
  (await serverClient.get(`/admin/ai/user/${userId}/history`)).data;

export const sendMessageToUser = async (data) =>
  (await serverClient.post('/admin/ai/message', data)).data;

export const getAdminMessages = async () =>
  (await serverClient.get('/admin/ai/messages')).data;

// User management
export const getAdminAllUsers = async (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return (await serverClient.get(`/admin/users?${q}`)).data;
};

export const toggleUserStatus = async (userId) =>
  (await serverClient.put(`/admin/users/${userId}/toggle`)).data;

export const deleteUserByAdmin = async (userId) =>
  (await serverClient.delete(`/admin/users/${userId}`)).data;

// Analytics
export const getAdminAnalytics = async () =>
  (await serverClient.get('/admin/analytics')).data;

// Export
export const exportAssessmentsCSV = () =>
  `${SERVER_API}/admin/ai/assessments/export`;

// AI Backend direct
export const getAIMetrics = async () => (await aiClient.get('/metrics')).data;
export const getAIHealth = async () => (await aiClient.get('/health')).data;

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

export default aiClient;
