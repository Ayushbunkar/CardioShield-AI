import RiskAssessment from "../models/riskAssessmentModel.js";
import AdminMessage from "../models/adminMessageModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

// ─── GET ALL USERS (with search, filter, pagination) ────────────────────────
export const getAllUsers = async (req, res, next) => {
  try {
    const { search, gender, status, role, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    if (gender && gender !== "all") filter.gender = gender;
    if (status && status !== "all") filter.status = status;
    if (role && role !== "all") filter.role = role;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .lean(),
      User.countDocuments(filter)
    ]);

    res.status(200).json({
      data: users,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// ─── BLOCK / UNBLOCK USER ───────────────────────────────────────────────────
export const toggleUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) { const e = new Error("User not found"); e.statusCode = 404; return next(e); }
    user.status = user.status === "Active" ? "Inactive" : "Active";
    await user.save();
    res.status(200).json({ message: `User ${user.status === "Active" ? "unblocked" : "blocked"}`, data: user });
  } catch (error) { next(error); }
};

// ─── DELETE USER ─────────────────────────────────────────────────────────────
export const deleteUserByAdmin = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) { const e = new Error("User not found"); e.statusCode = 404; return next(e); }
    if (user.role === "Admin") { const e = new Error("Cannot delete admin"); e.statusCode = 403; return next(e); }
    await User.findByIdAndDelete(userId);
    await RiskAssessment.deleteMany({ user: userId });
    await AdminMessage.deleteMany({ toUser: userId });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) { next(error); }
};

// ─── ANALYTICS ───────────────────────────────────────────────────────────────
export const getAnalytics = async (req, res, next) => {
  try {
    // Risk distribution
    const riskDistribution = await RiskAssessment.aggregate([
      { $group: { _id: "$riskLevel", count: { $sum: 1 } } },
    ]);

    // Age vs Risk (scatter)
    const ageVsRisk = await RiskAssessment.aggregate([
      {
        $project: {
          age: "$patientData.age",
          riskScore: 1,
          riskLevel: 1,
        },
      },
    ]);

    // Monthly assessment growth
    const monthlyGrowth = await RiskAssessment.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
          avgScore: { $avg: "$riskScore" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Gender-based risk
    const genderRisk = await RiskAssessment.aggregate([
      {
        $group: {
          _id: "$patientData.gender",
          avgRisk: { $avg: "$riskScore" },
          count: { $sum: 1 },
          highRisk: {
            $sum: { $cond: [{ $in: ["$riskLevel", ["High", "Very High"]] }, 1, 0] },
          },
        },
      },
    ]);

    // Active users today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const activeToday = await RiskAssessment.distinct("user", {
      createdAt: { $gte: todayStart },
    });

    res.status(200).json({
      data: {
        riskDistribution,
        ageVsRisk: ageVsRisk.slice(0, 200),
        monthlyGrowth,
        genderRisk,
        activeUsersToday: activeToday.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── EXPORT CSV ──────────────────────────────────────────────────────────────
export const exportAssessmentsCSV = async (req, res, next) => {
  try {
    const assessments = await RiskAssessment.find()
      .populate("user", "fullName email phone")
      .sort({ createdAt: -1 })
      .lean();

    const header = "Name,Email,Phone,Age,Gender,Height,Weight,BP_Systolic,BP_Diastolic,Cholesterol,Glucose,Smoke,Alcohol,Active,BMI,Risk_Score,Risk_Level,Prediction,Date\n";
    const rows = assessments.map((a) => {
      const p = a.patientData || {};
      return [
        a.user?.fullName || "", a.user?.email || "", a.user?.phone || "",
        p.age, p.gender, p.height, p.weight, p.ap_hi, p.ap_lo,
        p.cholesterol, p.gluc, p.smoke, p.alco, p.active,
        a.bmi?.toFixed(1) || "", (a.riskScore * 100).toFixed(1),
        a.riskLevel, a.prediction, new Date(a.createdAt).toISOString().split("T")[0],
      ].join(",");
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=assessments.csv");
    res.send(header + rows.join("\n"));
  } catch (error) {
    next(error);
  }
};

// Get all assessments (with filters)
export const getAllAssessments = async (req, res, next) => {
  try {
    const { riskLevel, limit = 20, page = 1 } = req.query;
    
    const filter = {};
    if (riskLevel) filter.riskLevel = riskLevel;

    const [assessments, total] = await Promise.all([
      RiskAssessment.find(filter)
        .populate("user", "fullName email phone photo")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .lean(),
      RiskAssessment.countDocuments(filter)
    ]);

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
    
    // Unique users who have taken assessments
    const uniqueUsersArr = await RiskAssessment.distinct("user");
    const uniqueUsers = uniqueUsersArr.length;

    const riskDistribution = await RiskAssessment.aggregate([
      { $group: { _id: "$riskLevel", count: { $sum: 1 } } },
    ]);

    // High risk count
    const highRiskCount = riskDistribution
      .filter(r => r._id === "High" || r._id === "Very High")
      .reduce((sum, r) => sum + r.count, 0);

    // High risk rate as percentage
    const highRiskRate = totalAssessments > 0 ? ((highRiskCount / totalAssessments) * 100) : 0;

    // Average risk score
    const avgResult = await RiskAssessment.aggregate([
      { $group: { _id: null, avgScore: { $avg: "$riskScore" } } },
    ]);
    const avgRiskScore = avgResult.length > 0 ? avgResult[0].avgScore : 0;

    const recentHighRisk = await RiskAssessment.find({ riskLevel: { $in: ["High", "Very High"] } })
      .populate("user", "fullName email")
      .sort({ createdAt: -1 })
      .limit(5);

    // Daily assessments for last 7 days
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

    // Monthly assessments for last 6 months
    const monthlyAssessments = await RiskAssessment.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
          avgScore: { $avg: "$riskScore" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Recent 5 assessments for reports table
    const recentAssessments = await RiskAssessment.find()
      .populate("user", "fullName email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      data: {
        totalUsers,
        totalAssessments,
        uniqueUsers,
        highRiskCount,
        highRiskRate,
        avgRiskScore,
        riskDistribution,
        recentHighRisk,
        dailyAssessments,
        monthlyAssessments,
        recentAssessments,
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

    const user = await User.findById(userId).select("-password").lean();
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    const assessments = await RiskAssessment.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

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
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ data: messages });
  } catch (error) {
    next(error);
  }
};
