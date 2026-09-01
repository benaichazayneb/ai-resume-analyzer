const mongoose = require("mongoose");

const jobDescriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },

    // Résultat de l'analyse de l'offre (section 10)
    extractedSkills: {
      requiredSkills: [{ type: String }],
      preferredSkills: [{ type: String }],
    },
    experienceRequirements: { type: String, default: "" },
    educationRequirements: { type: String, default: "" },
    keywords: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobDescription", jobDescriptionSchema);
