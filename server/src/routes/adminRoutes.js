import express from "express";
import { GetAllContacts, UpdateContacts } from "../controllers/adminController.js";
import { isAdmin, Protect } from "../middlewares/authMiddleware.js";
import {
  getAllAssessments,
  getHighRiskUsers,
  getDashboardStats,
  getUserAssessmentHistory,
  sendMessageToUser,
  getAdminMessages,
} from "../controllers/aiAdminController.js";

const router = express.Router();

// Existing routes
router.get("/contacts", Protect, isAdmin, GetAllContacts);
router.put("/contacts/:Qid", Protect, isAdmin, UpdateContacts);

// AI Assessment Admin routes
router.get("/ai/dashboard", Protect, isAdmin, getDashboardStats);
router.get("/ai/assessments", Protect, isAdmin, getAllAssessments);
router.get("/ai/high-risk", Protect, isAdmin, getHighRiskUsers);
router.get("/ai/user/:userId/history", Protect, isAdmin, getUserAssessmentHistory);
router.post("/ai/message", Protect, isAdmin, sendMessageToUser);
router.get("/ai/messages", Protect, isAdmin, getAdminMessages);

export default router;
