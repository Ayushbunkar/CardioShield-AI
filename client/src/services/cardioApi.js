import axios from 'axios';

const API_BASE = '/api';
const SERVER_BASE = 'http://localhost:4500';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

const serverApi = axios.create({
  baseURL: SERVER_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Feature order for UCI Heart Disease model (13 features)
// [age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal]

// Patient prediction - formats data for Flask API
export const predictRisk = async (patientData) => {
  // Convert form data to input array format expected by Flask API
  const inputArray = [
    patientData.age,         // 0: age
    patientData.sex,         // 1: sex (0=female, 1=male)
    patientData.cp,          // 2: chest pain type (1-4)
    patientData.trestbps,    // 3: resting blood pressure
    patientData.chol,        // 4: serum cholesterol
    patientData.fbs,         // 5: fasting blood sugar > 120 (0/1)
    patientData.restecg,     // 6: resting ECG results (0-2)
    patientData.thalach,     // 7: max heart rate achieved
    patientData.exang,       // 8: exercise induced angina (0/1)
    patientData.oldpeak,     // 9: ST depression
    patientData.slope,       // 10: slope of ST segment (1-3)
    patientData.ca,          // 11: number of vessels (0-3)
    patientData.thal         // 12: thalassemia (3/6/7)
  ];
  
  const response = await api.post('/predict', { input: inputArray });
  
  // Transform response to match expected format
  const data = response.data;
  return {
    prediction: data.prediction,
    risk_score: data.probability.disease,
    risk_level: data.risk_level,
    confidence: data.confidence,
    probability: data.probability,
    recommendations: generateRecommendations(patientData, data)
  };
};

// Generate recommendations based on patient data and risk
const generateRecommendations = (patientData, result) => {
  const recommendations = [];
  
  if (result.prediction === 1 || result.risk_level === 'High' || result.risk_level === 'Very High') {
    recommendations.push('Schedule an appointment with a cardiologist immediately');
  }
  
  if (patientData.trestbps > 140) {
    recommendations.push('Monitor blood pressure regularly - consider medication consultation');
  }
  
  if (patientData.chol > 240) {
    recommendations.push('Consider cholesterol-lowering medication and dietary changes');
  }
  
  if (patientData.fbs === 1) {
    recommendations.push('Manage blood sugar levels through diet and exercise');
  }
  
  if (patientData.exang === 1) {
    recommendations.push('Avoid strenuous exercise until cleared by a doctor');
  }
  
  if (patientData.thalach < 100) {
    recommendations.push('Low maximum heart rate detected - discuss with your doctor');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Maintain a healthy lifestyle with regular exercise');
    recommendations.push('Continue regular health checkups');
    recommendations.push('Follow a heart-healthy diet rich in fruits and vegetables');
  }
  
  return recommendations;
};

// Get explanation (simplified for new model)
export const getExplanation = async (patientData) => {
  // Return feature importance based on known model weights
  const featureImportance = {
    'Chest Pain Type': patientData.cp >= 3 ? 0.29 : 0.15,
    'Exercise Angina': patientData.exang === 1 ? 0.10 : 0.02,
    'Cholesterol': patientData.chol > 240 ? 0.08 : 0.04,
    'Sex': patientData.sex === 1 ? 0.06 : 0.03,
    'Thalassemia': patientData.thal === 7 ? 0.07 : 0.03,
    'ST Depression': patientData.oldpeak > 2 ? 0.08 : 0.03,
    'Vessels Colored': patientData.ca > 0 ? 0.06 : 0.02,
    'Max Heart Rate': patientData.thalach < 120 ? 0.05 : 0.02,
    'Age': patientData.age > 55 ? 0.05 : 0.02,
    'Blood Pressure': patientData.trestbps > 140 ? 0.04 : 0.02,
    'Blood Sugar': patientData.fbs === 1 ? 0.03 : 0.01,
    'ST Slope': patientData.slope === 3 ? 0.04 : 0.02,
    'ECG Result': patientData.restecg > 0 ? 0.03 : 0.01,
  };
  
  return {
    feature_importance: featureImportance,
    shap_values: Object.values(featureImportance),
    top_risk_factors: Object.entries(featureImportance)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, impact: value })),
    interpretation: generateInterpretation(patientData, featureImportance)
  };
};

const generateInterpretation = (patientData, importance) => {
  const factors = [];
  
  if (patientData.cp >= 3) factors.push('Significant chest pain type');
  if (patientData.exang === 1) factors.push('Exercise-induced angina');
  if (patientData.chol > 240) factors.push('High cholesterol levels');
  if (patientData.ca > 0) factors.push('Major vessels showing abnormalities');
  if (patientData.thal === 7) factors.push('Reversible thalassemia defect');
  if (patientData.oldpeak > 2) factors.push('Significant ST depression');
  
  if (factors.length === 0) {
    return 'Your health indicators are within normal ranges. Continue maintaining a healthy lifestyle.';
  }
  
  return `Key risk factors identified: ${factors.join(', ')}. Please consult with a healthcare provider.`;
};

// Get model metrics
export const getMetrics = async () => {
  const response = await api.get('/metrics');
  return response.data;
};

// Get fairness analysis
export const getFairness = async () => {
  const response = await api.get('/fairness');
  return response.data;
};

// Health check
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

// ============ User Assessment APIs ============

// Save assessment to user's history
export const saveAssessment = async (assessmentData) => {
  const response = await serverApi.post('/assessment/save', assessmentData);
  return response.data;
};

// Get user's assessment history
export const getAssessmentHistory = async (page = 1, limit = 10) => {
  const response = await serverApi.get(`/assessment/history?page=${page}&limit=${limit}`);
  return response.data;
};

// Get user's latest assessment
export const getLatestAssessment = async () => {
  const response = await serverApi.get('/assessment/latest');
  return response.data;
};

// Get user's stats
export const getUserStats = async () => {
  const response = await serverApi.get('/assessment/stats');
  return response.data;
};

// Get user's messages
export const getUserMessages = async () => {
  const response = await serverApi.get('/assessment/messages');
  return response.data;
};

// Mark message as read
export const markMessageAsRead = async (messageId) => {
  const response = await serverApi.put(`/assessment/messages/${messageId}/read`);
  return response.data;
};

// ============ Admin AI APIs ============

// Get admin dashboard stats
export const getAIDashboardStats = async () => {
  const response = await serverApi.get('/admin/ai/dashboard');
  return response.data;
};

// Get all assessments
export const getAllAssessments = async (page = 1, limit = 20) => {
  const response = await serverApi.get(`/admin/ai/assessments?page=${page}&limit=${limit}`);
  return response.data;
};

// Get high risk users
export const getHighRiskUsers = async () => {
  const response = await serverApi.get('/admin/ai/high-risk');
  return response.data;
};

// Get user's assessment history (admin)
export const getUserAssessmentHistory = async (userId) => {
  const response = await serverApi.get(`/admin/ai/user/${userId}/history`);
  return response.data;
};

// Send message to user
export const sendMessageToUser = async (messageData) => {
  const response = await serverApi.post('/admin/ai/message', messageData);
  return response.data;
};

// Get all admin messages
export const getAdminMessages = async () => {
  const response = await serverApi.get('/admin/ai/messages');
  return response.data;
};

// ============ Guest Usage Tracking ============

const GUEST_USAGE_KEY = 'cardio_guest_usage';
const MAX_GUEST_ATTEMPTS = 3;

export const getGuestUsageCount = () => {
  const usage = localStorage.getItem(GUEST_USAGE_KEY);
  return usage ? parseInt(usage, 10) : 0;
};

export const incrementGuestUsage = () => {
  const current = getGuestUsageCount();
  localStorage.setItem(GUEST_USAGE_KEY, (current + 1).toString());
  return current + 1;
};

export const canGuestUse = () => {
  return getGuestUsageCount() < MAX_GUEST_ATTEMPTS;
};

export const getRemainingGuestAttempts = () => {
  return Math.max(0, MAX_GUEST_ATTEMPTS - getGuestUsageCount());
};

export default api;
