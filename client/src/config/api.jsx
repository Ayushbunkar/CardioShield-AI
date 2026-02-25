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

/**
 * Axios instance for the Express backend (auth, users, admin, assessments).
 * Uses VITE_SERVER_URL env var in production; defaults to localhost:4500 in dev.
 */
const api = axios.create({
  baseURL: ensureHttps(import.meta.env.VITE_SERVER_URL) || "http://localhost:4500",
  withCredentials: true,
  timeout: 60000,
});

// Intercept network/CORS errors and provide clear messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error or CORS block — no response from server
      console.error("[API] Network error — server may be starting up or CORS not configured:", error.message);
      error.message = "Server is starting up. Please wait 30s and try again.";
    }
    return Promise.reject(error);
  }
);

export default api;
