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

    const limitParsed = parseInt(limit) || 10;
    const pageParsed = parseInt(page) || 1;

    const [assessments, total] = await Promise.all([
      RiskAssessment.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(limitParsed)
        .skip((pageParsed - 1) * limitParsed)
        .lean(),
      RiskAssessment.countDocuments({ user: userId })
    ]);

    res.status(200).json({
      data: assessments,
      pagination: {
        total,
        page: pageParsed,
        pages: Math.ceil(total / limitParsed),
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
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ data: assessment });
  } catch (error) {
    next(error);
  }
};

// Get user's risk statistics
export const getUserStats = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const results = await RiskAssessment.aggregate([
      { $match: { user: userId } },
      {
        $facet: {
          stats: [
            { $sort: { createdAt: 1 } },
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
          ],
          riskDistribution: [
            { $group: { _id: "$riskLevel", count: { $sum: 1 } } },
          ],
        },
      },
    ]);

    const stats = results[0].stats[0] || { totalAssessments: 0, avgRiskScore: 0, highRiskCount: 0 };
    const riskDistribution = results[0].riskDistribution;

    res.status(200).json({
      data: {
        stats,
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

    const [messages, unreadCount] = await Promise.all([
      AdminMessage.find({ toUser: userId })
        .populate("fromAdmin", "fullName email")
        .populate("assessment", "riskLevel riskScore createdAt")
        .sort({ createdAt: -1 })
        .lean(),
      AdminMessage.countDocuments({ toUser: userId, isRead: false })
    ]);

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
