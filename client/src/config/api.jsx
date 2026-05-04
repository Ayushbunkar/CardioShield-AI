import axios from "axios";

/**
 * Ensure URL has https:// prefix.
 * Render's `host` property returns just the hostname (no scheme).
 */
const ensureHttps = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
};

const LOCAL_API_URL = "http://localhost:4500";
const ENV_API_URL = ensureHttps(import.meta.env.VITE_SERVER_URL);
const API_BASE_URL = ENV_API_URL || LOCAL_API_URL;

if (import.meta.env.PROD && !ENV_API_URL) {
  console.warn("[API] VITE_SERVER_URL is not set in production; using localhost fallback.");
}

/**
 * Axios instance for the Express backend (auth, users, admin, assessments).
 * Uses VITE_SERVER_URL in production; falls back to localhost in dev.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 60000,
});

// Intercept network/CORS errors and provide clear messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error or CORS block — no response from server
      console.error("[API] Network error — backend not reachable:", error.message);
      if (ENV_API_URL) {
        error.message = `Backend not reachable. Check ${ENV_API_URL} and CORS settings.`;
      } else {
        error.message = `Backend not reachable. Set VITE_SERVER_URL or start the API server on ${LOCAL_API_URL}.`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
