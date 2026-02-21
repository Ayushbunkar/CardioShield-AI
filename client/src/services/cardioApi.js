import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
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

export default api;
