import mongoose from "mongoose";

const riskAssessmentSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Patient input data
    patientData: {
      age: { type: Number, required: true },
      gender: { type: Number, required: true },
      height: { type: Number, required: true },
      weight: { type: Number, required: true },
      ap_hi: { type: Number, required: true },
      ap_lo: { type: Number, required: true },
      cholesterol: { type: Number, required: true },
      gluc: { type: Number, required: true },
      smoke: { type: Number, required: true },
      alco: { type: Number, required: true },
      active: { type: Number, required: true },
      family_history: { type: Number, default: 0 },
    },
    // Consent & governance
    consentGiven: { type: Boolean, default: false },
    disclaimer: { type: String },
    escalation: { type: String, default: null },
    modelVersion: { type: String },
    // AI prediction results
    riskScore: { type: Number, required: true },
    riskLevel: {
      type: String,
      enum: ["Low", "Moderate", "High", "Very High"],
      required: true,
    },
    prediction: { type: Number, required: true },
    confidence: { type: Number, required: true },
    recommendations: [{ type: String }],
    // Calculated BMI
    bmi: { type: Number },
  },
  { timestamps: true }
);

// Index for faster queries
riskAssessmentSchema.index({ user: 1, createdAt: -1 });
riskAssessmentSchema.index({ riskLevel: 1 });

const RiskAssessment = mongoose.model("RiskAssessment", riskAssessmentSchema);

export default RiskAssessment;
