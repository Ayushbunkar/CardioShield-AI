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
  getAllUsers,
  toggleUserStatus,
  deleteUserByAdmin,
  getAnalytics,
  exportAssessmentsCSV,
} from "../controllers/aiAdminController.js";
import AuditLog from "../models/auditLogModel.js";

const router = express.Router();

// Existing routes
router.get("/contacts", Protect, isAdmin, GetAllContacts);
router.put("/contacts/:Qid", Protect, isAdmin, UpdateContacts);

// AI Assessment Admin routes
router.get("/ai/dashboard", Protect, isAdmin, getDashboardStats);
router.get("/ai/assessments", Protect, isAdmin, getAllAssessments);
router.get("/ai/assessments/export", Protect, isAdmin, exportAssessmentsCSV);
router.get("/ai/high-risk", Protect, isAdmin, getHighRiskUsers);
router.get("/ai/user/:userId/history", Protect, isAdmin, getUserAssessmentHistory);
router.post("/ai/message", Protect, isAdmin, sendMessageToUser);
router.get("/ai/messages", Protect, isAdmin, getAdminMessages);

// User management
router.get("/users", Protect, isAdmin, getAllUsers);
router.put("/users/:userId/toggle", Protect, isAdmin, toggleUserStatus);
router.delete("/users/:userId", Protect, isAdmin, deleteUserByAdmin);

// Analytics
router.get("/analytics", Protect, isAdmin, getAnalytics);

// Audit Logs (server-side MongoDB)
router.get("/audit-logs", Protect, isAdmin, async (req, res) => {
  try {
    const { limit = 50, page = 1, action } = req.query;
    const filter = action ? { action } : {};
    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate("userId", "fullName email");
    const total = await AuditLog.countDocuments(filter);
    res.json({ data: logs, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
