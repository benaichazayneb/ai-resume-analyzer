const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true,
    },

    // ==========================================================
    // CONVERSATION
    // ==========================================================

    questions: [
      {
        question: {
          type: String,
          required: true,
        },

        type: {
          type: String,
          enum: [
            "TECHNICAL",
            "BEHAVIORAL",
            "EXPERIENCE",
          ],
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

    // ==========================================================
    // STATUT
    // ==========================================================

    status: {
      type: String,
      enum: [
        "READY",
        "IN_PROGRESS",
        "COMPLETED",
      ],
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

    // ==========================================================
    // VIDÉO
    // ==========================================================

    video: {
      status: {
        type: String,
        enum: [
          "NOT_UPLOADED",
          "UPLOADING",
          "UPLOADED",
          "FAILED",
        ],
        default: "NOT_UPLOADED",
      },

      filename: {
        type: String,
        default: "",
      },

      path: {
        type: String,
        default: "",
      },

      mimeType: {
        type: String,
        default: "",
      },

      size: {
        type: Number,
        default: 0,
      },

      duration: {
        type: Number,
        default: 0,
      },

      uploadedAt: {
        type: Date,
        default: null,
      },
    },

    // ==========================================================
    // TRANSCRIPTION
    // ==========================================================

    transcription: {
      status: {
        type: String,
        enum: [
          "NOT_TRANSCRIBED",
          "TRANSCRIBING",
          "COMPLETED",
          "FAILED",
        ],
        default: "NOT_TRANSCRIBED",
      },

      text: {
        type: String,
        default: "",
      },

      language: {
        type: String,
        default: "",
      },

      transcribedAt: {
        type: Date,
        default: null,
      },

      error: {
        type: String,
        default: "",
      },
    },

    // ==========================================================
    // COMPUTER VISION
    // ==========================================================

    computerVision: {
      status: {
        type: String,
        enum: [
          "NOT_ANALYZED",
          "ANALYZING",
          "COMPLETED",
          "FAILED",
        ],
        default: "NOT_ANALYZED",
      },

      // Présence d'un visage dans la vidéo
      faceDetection: {
        detected: {
          type: Boolean,
          default: false,
        },

        detectionRate: {
          type: Number,
          default: null,
        },
      },

      // Visibilité du visage
      faceVisibility: {
        averageVisibility: {
          type: Number,
          default: null,
        },

        observations: {
          type: [String],
          default: [],
        },
      },

      // Estimation de la direction du regard
      gaze: {
        observations: {
          type: [String],
          default: [],
        },
      },

      // Mouvements de la tête
      headMovement: {
        observations: {
          type: [String],
          default: [],
        },
      },

      // Qualité générale de la vidéo
      videoQuality: {
        brightness: {
          type: Number,
          default: null,
        },

        observations: {
          type: [String],
          default: [],
        },
      },

      // Présence générale du candidat pendant l'entretien
      presence: {
        observations: {
          type: [String],
          default: [],
        },
      },

      // Résumé des observations CV
      summary: {
        type: String,
        default: "",
      },

      analyzedAt: {
        type: Date,
        default: null,
      },

      error: {
        type: String,
        default: "",
      },
    },

    // ==========================================================
    // ANALYSE
    // ==========================================================

    analysis: {
      status: {
        type: String,
        enum: [
          "NOT_ANALYZED",
          "ANALYZING",
          "COMPLETED",
          "FAILED",
        ],
        default: "NOT_ANALYZED",
      },

      // --------------------------------------------------------
      // SCORES
      // --------------------------------------------------------

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

      // --------------------------------------------------------
      // RÉSULTATS
      // --------------------------------------------------------

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

      // --------------------------------------------------------
      // OBSERVATIONS DE COMMUNICATION
      // --------------------------------------------------------

      communicationObservations: {
        type: [String],
        default: [],
      },

      // --------------------------------------------------------
      // OBSERVATIONS LINGUISTIQUES / TONALITÉ
      // --------------------------------------------------------

      sentimentObservations: {
        type: [String],
        default: [],
      },

      // --------------------------------------------------------
      // RÉSUMÉ CV
      // --------------------------------------------------------

      resumeObservations: {
        type: [String],
        default: [],
      },

      // --------------------------------------------------------
      // RÉSUMÉ FINAL DU RAPPORT
      // --------------------------------------------------------

      finalReportSummary: {
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

module.exports = mongoose.model(
  "Interview",
  interviewSchema
);