const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true,
    },

    questions: [
      {
        question: {
          type: String,
          required: true,
        },

        type: {
          type: String,
          enum: ["TECHNICAL", "BEHAVIORAL", "EXPERIENCE"],
          required: true,
        },

        skill: {
          type: String,
          default: "",
        },

        answer: {
          type: String,
          default: "",
        },
      },
    ],

    currentQuestionIndex: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["READY", "IN_PROGRESS", "COMPLETED"],
      default: "READY",
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    // Analyse IA de l'entretien
    analysis: {
      status: {
        type: String,
        enum: ["NOT_ANALYZED", "ANALYZING", "COMPLETED", "FAILED"],
        default: "NOT_ANALYZED",
      },

      overallScore: {
        type: Number,
        default: null,
      },

      technicalScore: {
        type: Number,
        default: null,
      },

      communicationScore: {
        type: Number,
        default: null,
      },

      relevanceScore: {
        type: Number,
        default: null,
      },

      strengths: {
        type: [String],
        default: [],
      },

      weaknesses: {
        type: [String],
        default: [],
      },

      recommendations: {
        type: [String],
        default: [],
      },

      summary: {
        type: String,
        default: "",
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

module.exports = mongoose.model("Interview", interviewSchema);