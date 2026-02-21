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

// Patient prediction
export const predictRisk = async (patientData) => {
  const response = await api.post('/predict', patientData);
  return response.data;
};

// Get SHAP explanations
export const getExplanation = async (patientData) => {
  const response = await api.post('/explain', patientData);
  return response.data;
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
