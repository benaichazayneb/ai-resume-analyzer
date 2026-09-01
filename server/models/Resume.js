const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Métadonnées du fichier uploadé (voir Phase 6 - Multer)
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },

    // Texte brut extrait du PDF (voir Phase 7)
    rawText: { type: String, default: "" },

    // Données structurées extraites par le module resumeAnalyzer (section 8)
    parsedData: {
      personalInfo: {
        name: String,
        email: String,
        phone: String,
        location: String,
        linkedin: String,
        github: String,
      },
      education: [
        {
          degree: String,
          institution: String,
          year: Number,
        },
      ],
      experience: [
        {
          jobTitle: String,
          company: String,
          duration: String,
          description: String,
        },
      ],
    },

    // Compétences détectées (section 9)
    skills: {
      technicalSkills: [{ type: String }],
      softSkills: [{ type: String }],
    },

    // Classification de domaine (section 16, optionnelle)
    detectedDomain: {
      category: { type: String, default: null },
      confidence: { type: Number, default: null },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);
