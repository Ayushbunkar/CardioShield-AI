import RiskAssessment from "../models/riskAssessmentModel.js";
import AdminMessage from "../models/adminMessageModel.js";
import User from "../models/userModel.js";

// Get all assessments (with filters)
export const getAllAssessments = async (req, res, next) => {
  try {
    const { riskLevel, limit = 20, page = 1 } = req.query;
    
    const filter = {};
    if (riskLevel) filter.riskLevel = riskLevel;

    const assessments = await RiskAssessment.find(filter)
      .populate("user", "fullName email phone photo")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await RiskAssessment.countDocuments(filter);

    res.status(200).json({
      data: assessments,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// Get high risk users
export const getHighRiskUsers = async (req, res, next) => {
  try {
    const highRiskAssessments = await RiskAssessment.aggregate([
      { $match: { riskLevel: { $in: ["High", "Very High"] } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$user",
          latestAssessment: { $first: "$$ROOT" },
          assessmentCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          user: "$userInfo",
          latestAssessment: 1,
          assessmentCount: 1,
        },
      },
    ]);

    res.status(200).json({ data: highRiskAssessments });
  } catch (error) {
    next(error);
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: "User", status: "Active" });
    const totalAssessments = await RiskAssessment.countDocuments();
    
    const riskDistribution = await RiskAssessment.aggregate([
      { $group: { _id: "$riskLevel", count: { $sum: 1 } } },
    ]);

    const recentHighRisk = await RiskAssessment.find({ riskLevel: { $in: ["High", "Very High"] } })
      .populate("user", "fullName email")
      .sort({ createdAt: -1 })
      .limit(5);

    const dailyAssessments = await RiskAssessment.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      data: {
        totalUsers,
        totalAssessments,
        riskDistribution,
        recentHighRisk,
        dailyAssessments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user's assessment history (for admin)
export const getUserAssessmentHistory = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    const assessments = await RiskAssessment.find({ user: userId })
      .sort({ createdAt: -1 });

    res.status(200).json({ data: { user, assessments } });
  } catch (error) {
    next(error);
  }
};

// Send message to user
export const sendMessageToUser = async (req, res, next) => {
  try {
    const adminId = req.user._id;
    const { userId, subject, message, priority, assessmentId } = req.body;

    if (!userId || !subject || !message) {
      const error = new Error("User, subject, and message are required");
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    const newMessage = await AdminMessage.create({
      fromAdmin: adminId,
      toUser: userId,
      subject,
      message,
      priority: priority || "Medium",
      assessment: assessmentId || null,
    });

    await newMessage.populate("fromAdmin", "fullName email");

    res.status(201).json({
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    next(error);
  }
};

// Get all messages sent by admin
export const getAdminMessages = async (req, res, next) => {
  try {
    const messages = await AdminMessage.find()
      .populate("fromAdmin", "fullName")
      .populate("toUser", "fullName email")
      .populate("assessment", "riskLevel riskScore")
      .sort({ createdAt: -1 });

    res.status(200).json({ data: messages });
  } catch (error) {
    next(error);
  }
};
