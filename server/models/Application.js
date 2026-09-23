const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobDescription",
      required: true,
      index: true,
    },

    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "PENDING_MATCHING",
        "MATCHED",
        "SHORTLISTED",
        "NOT_SELECTED",
        "INTERVIEW_INVITED",
        "INTERVIEW_COMPLETED",
        "HIRED",
        "REJECTED",
      ],
      default: "PENDING_MATCHING",
      required: true,
    },

    matching: {
      score: {
        type: Number,
        default: null,
        min: 0,
        max: 100,
      },

      skillsScore: {
        type: Number,
        default: null,
        min: 0,
        max: 100,
      },

      similarityScore: {
        type: Number,
        default: null,
        min: 0,
        max: 100,
      },

      keywordScore: {
        type: Number,
        default: null,
        min: 0,
        max: 100,
      },

      experienceScore: {
        type: Number,
        default: null,
        min: 0,
        max: 100,
      },

      educationScore: {
        type: Number,
        default: null,
        min: 0,
        max: 100,
      },

      matchedSkills: {
        type: [String],
        default: [],
      },

      missingSkills: {
        type: [String],
        default: [],
      },

      matchedKeywords: {
        type: [String],
        default: [],
      },

      missingKeywords: {
        type: [String],
        default: [],
      },

      analyzedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index(
  { candidateId: 1, jobId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Application", applicationSchema);