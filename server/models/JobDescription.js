const mongoose = require("mongoose");

const jobDescriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    extractedSkills: {
      requiredSkills: [{ type: String }],
      preferredSkills: [{ type: String }],
    },

    experienceRequirements: {
      type: String,
      default: "",
    },

    educationRequirements: {
      type: String,
      default: "",
    },

    keywords: [{ type: String }],

    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "CLOSED"],
      default: "DRAFT",
      required: true,
    },

    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("JobDescription", jobDescriptionSchema);