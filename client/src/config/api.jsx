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

export default api;
