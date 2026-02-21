import mongoose from "mongoose";

const adminMessageSchema = mongoose.Schema(
  {
    fromAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RiskAssessment",
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Index for faster queries
adminMessageSchema.index({ toUser: 1, isRead: 1, createdAt: -1 });

const AdminMessage = mongoose.model("AdminMessage", adminMessageSchema);

export default AdminMessage;
