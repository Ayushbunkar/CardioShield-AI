import mongoose from "mongoose";

const auditLogSchema = mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["prediction", "fairness_audit", "explanation_request", "data_access", "consent_given", "mitigation_run"],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    inputHash: { type: String, default: null },
    riskScore: { type: Number, default: null },
    riskLevel: { type: String, default: null },
    modelVersion: { type: String, default: null },
    consentGiven: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: null },
  },
  { timestamps: true }
);

auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
