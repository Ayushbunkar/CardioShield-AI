import mongoose from "mongoose";
import RiskAssessment from "../models/riskAssessmentModel.js";
import AdminMessage from "../models/adminMessageModel.js";
import User from "../models/userModel.js";

// Save a new risk assessment for a user
export const saveAssessment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { patientData, riskScore, riskLevel, prediction, confidence, recommendations, disclaimer, escalation, modelVersion } = req.body;

    if (!patientData || riskScore === undefined || !riskLevel) {
      const error = new Error("Missing required assessment data");
      error.statusCode = 400;
      return next(error);
    }

    // Calculate BMI
    const bmi = patientData.weight / Math.pow(patientData.height / 100, 2);

    const assessment = await RiskAssessment.create({
      user: userId,
      patientData,
      riskScore,
      riskLevel,
      prediction,
      confidence,
      recommendations,
      bmi,
      consentGiven: true,
      disclaimer: disclaimer || '',
      escalation: escalation || null,
      modelVersion: modelVersion || '',
    });

    res.status(201).json({
      message: "Assessment saved successfully",
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
};

// Get user's assessment history
export const getUserAssessments = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { limit = 10, page = 1 } = req.query;

    const assessments = await RiskAssessment.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await RiskAssessment.countDocuments({ user: userId });

    res.status(200).json({
      data: assessments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user's latest assessment
export const getLatestAssessment = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const assessment = await RiskAssessment.findOne({ user: userId })
      .sort({ createdAt: -1 });

    res.status(200).json({ data: assessment });
  } catch (error) {
    next(error);
  }
};

// Get user's risk statistics
export const getUserStats = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const stats = await RiskAssessment.aggregate([
      { $match: { user: userId } },
      { $sort: { createdAt: 1 } }, // Ensure order for $last
      {
        $group: {
          _id: null,
          totalAssessments: { $sum: 1 },
          avgRiskScore: { $avg: "$riskScore" },
          highRiskCount: {
            $sum: { $cond: [{ $in: ["$riskLevel", ["High", "Very High"]] }, 1, 0] },
          },
          latestRiskScore: { $last: "$riskScore" },
        },
      },
    ]);

    const riskDistribution = await RiskAssessment.aggregate([
      { $match: { user: userId } },
      { $group: { _id: "$riskLevel", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      data: {
        stats: stats[0] || { totalAssessments: 0, avgRiskScore: 0, highRiskCount: 0 },
        riskDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user's messages from admin
export const getUserMessages = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const messages = await AdminMessage.find({ toUser: userId })
      .populate("fromAdmin", "fullName email")
      .populate("assessment", "riskLevel riskScore createdAt")
      .sort({ createdAt: -1 });

    const unreadCount = await AdminMessage.countDocuments({ toUser: userId, isRead: false });

    res.status(200).json({ data: messages, unreadCount });
  } catch (error) {
    next(error);
  }
};

// Mark message as read
export const markMessageRead = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await AdminMessage.findOneAndUpdate(
      { _id: messageId, toUser: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!message) {
      const error = new Error("Message not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({ message: "Message marked as read", data: message });
  } catch (error) {
    next(error);
  }
};
