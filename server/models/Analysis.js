const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },
    jobDescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobDescription",
      required: true,
    },

    // Score global (section 13)
    matchScore: { type: Number, required: true, min: 0, max: 100 },

    // Sous-scores pondérés (section 13)
    skillsScore: { type: Number, default: 0, min: 0, max: 100 },
    similarityScore: { type: Number, default: 0, min: 0, max: 100 },
    keywordScore: { type: Number, default: 0, min: 0, max: 100 },
    experienceScore: { type: Number, default: 0, min: 0, max: 100 },
    educationScore: { type: Number, default: 0, min: 0, max: 100 },

    // Compétences (section 14)
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],

    // Mots-clés (section 15)
    matchedKeywords: [{ type: String }],
    missingKeywords: [{ type: String }],

    // Sorties GenAI (sections 17-19)
    professionalSummary: { type: String, default: "" },
    recommendations: [{ type: String }],
    interviewQuestions: {
      technical: [{ type: String }],
      behavioral: [{ type: String }],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Analysis", analysisSchema);
