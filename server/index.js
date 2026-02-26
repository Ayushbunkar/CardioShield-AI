/**
 * CardioShield Server - Express API Gateway
 * ==========================================
 * Main server connecting frontend to MongoDB and AI backend.
 */

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createProxyMiddleware } from "http-proxy-middleware";

import connectDB from "./src/config/db.js";
import cloudinary from "./src/config/cloudinary.js";
import AuthRouter from "./src/routes/authRoutes.js";
import UserRouter from "./src/routes/userRoutes.js";
import PublicRouter from "./src/routes/publicRoutes.js";
import AdminRouter from "./src/routes/adminRoutes.js";
import AssessmentRouter from "./src/routes/assessmentRoutes.js";

// =============================================================================
// CONFIG
// =============================================================================

const PORT = process.env.PORT || 4500;
const AI_BACKEND = process.env.AI_BACKEND_URL || "http://localhost:5001";

// CORS: use CORS_ORIGINS env var in production, localhost defaults in dev
const ALLOWED_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map(o => o.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

const IS_PROD = process.env.NODE_ENV === "production";

// =============================================================================
// APP SETUP
// =============================================================================

const app = express();

// CORS must come first for preflight requests
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));

// AI Backend Proxy — must be BEFORE express.json() so body isn't consumed
app.use("/ai", createProxyMiddleware({
  target: AI_BACKEND,
  changeOrigin: true,
  timeout: 120000,          // 2 min — Render free tier can be slow to wake
  proxyTimeout: 120000,
  pathRewrite: { "^/ai": "" },
  onProxyReq: (proxyReq, req) => {
    console.log(`[AI] ${req.method} ${req.path}`);
  },
  onError: (err, req, res) => {
    console.error("[AI Error]", err.message);
    res.status(503).json({ error: "AI backend unavailable" });
  }
}));

// Middleware (after proxy so body isn't consumed before forwarding)
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// =============================================================================
// ROUTES
// =============================================================================

app.use("/auth", AuthRouter);
app.use("/user", UserRouter);
app.use("/public", PublicRouter);
app.use("/admin", AdminRouter);
app.use("/assessment", AssessmentRouter);

// Health check
app.get("/", (req, res) => res.json({ status: "ok", service: "CardioShield API" }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({ message: err.message || "Server error" });
});

// =============================================================================
// START
// =============================================================================

app.listen(PORT, async () => {
  console.log(`\n[Server] http://localhost:${PORT}`);
  console.log(`[AI Backend] ${AI_BACKEND}`);
  console.log(`[Environment] ${IS_PROD ? "production" : "development"}`);
  
  try {
    await connectDB();
    console.log("[DB] Connected");
  } catch (err) {
    console.error("[DB Error]", err.message);
    process.exit(1);
  }

  try {
    await cloudinary.api.resources({ max_results: 1 });
    console.log("[Cloudinary] Connected\n");
  } catch (err) {
    console.warn("[Cloudinary] Not configured (optional)\n");
  }
});
