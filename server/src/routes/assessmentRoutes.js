import express from "express";
import { Protect } from "../middlewares/authMiddleware.js";
import {
  saveAssessment,
  getUserAssessments,
  getLatestAssessment,
  getUserStats,
  getUserMessages,
  markMessageRead,
} from "../controllers/assessmentController.js";

const router = express.Router();

// All routes require authentication
router.use(Protect);

// Assessment routes
router.post("/save", saveAssessment);
router.get("/history", getUserAssessments);
router.get("/latest", getLatestAssessment);
router.get("/stats", getUserStats);

// Message routes
router.get("/messages", getUserMessages);
router.put("/messages/:messageId/read", markMessageRead);

export default router;
