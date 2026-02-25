import axios from "axios";

/**
 * Axios instance for the Express backend (auth, users, admin, assessments).
 * Uses VITE_SERVER_URL env var in production; defaults to localhost:4500 in dev.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:4500",
  withCredentials: true,
});

export default api;
