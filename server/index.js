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

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000"
];

// =============================================================================
// APP SETUP
// =============================================================================

const app = express();

// Middleware
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
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

// AI Backend Proxy
app.use("/ai", createProxyMiddleware({
  target: AI_BACKEND,
  changeOrigin: true,
  pathRewrite: { "^/ai": "" },
  onProxyReq: (proxyReq, req) => {
    console.log(`[AI] ${req.method} ${req.path}`);
  },
  onError: (err, req, res) => {
    console.error("[AI Error]", err.message);
    res.status(503).json({ error: "AI backend unavailable" });
  }
}));

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
  
  try {
    await connectDB();
    await cloudinary.api.resources({ max_results: 1 });
    console.log("[DB] Connected");
    console.log("[Cloudinary] Connected\n");
  } catch (err) {
    console.error("[Error]", err.message);
    process.exit(1);
  }
});
