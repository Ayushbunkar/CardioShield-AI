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
import mongoose from "mongoose";

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
  // Re-stream the body for POST/PUT if express.json() consumed it upstream
  onProxyReq: (proxyReq, req) => {
    console.log(`[AI] ${req.method} ${req.path}`);
    // If body was already parsed (e.g. by another middleware), re-write it
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader("Content-Type", "application/json");
      proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onError: (err, req, res) => {
    console.error("[AI Error]", err.message);
    if (!res.headersSent) {
      res.status(503).json({ error: "AI backend unavailable", details: err.message });
    }
  }
}));

// Middleware (after proxy so body isn't consumed before forwarding)
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use((req, res, next) => {
  if (req.path === "/" || req.path.startsWith("/ai")) {
    return next();
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database unavailable" });
  }

  return next();
});

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

const connectDBWithRetry = async (delayMs = 10000) => {
  const result = await connectDB();
  if (result.ok) {
    return;
  }

  if (result.reason === "missing-uri") {
    console.warn("[DB] Skipping retries because MONGO_URI is missing.");
    return;
  }

  console.warn(`[DB] Retry in ${delayMs / 1000}s`);
  setTimeout(() => connectDBWithRetry(delayMs), delayMs);
};

app.listen(PORT, async () => {
  console.log(`\n[Server] http://localhost:${PORT}`);
  console.log(`[AI Backend] ${AI_BACKEND}`);
  console.log(`[Environment] ${IS_PROD ? "production" : "development"}`);

  connectDBWithRetry();

  try {
    await cloudinary.api.resources({ max_results: 1 });
    console.log("[Cloudinary] Connected\n");
  } catch (err) {
    console.warn("[Cloudinary] Not configured (optional)\n");
  }
});
