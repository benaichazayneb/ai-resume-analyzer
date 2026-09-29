const Application = require("../models/Application");
const Interview = require("../models/Interview");
const Resume = require("../models/Resume");

const {
  transcribeInterviewVideo,
  analyzeInterviewConversation,
} = require("../services/interviewAIService");

const {
  analyzeInterviewVideo,
} = require("../services/computerVisionService");

// ============================================================
// UTILITAIRES COMPUTER VISION
// ============================================================

/**
 * Construit une version propre et exploitable
 * des résultats Computer Vision.
 *
 * IMPORTANT :
 * On utilise uniquement les informations réellement
 * retournées par computer_vision.py.
 *
 * Aucune détection d'émotion, de stress, de mensonge
 * ou d'état mental n'est ajoutée.
 */
const buildComputerVisionReport = (computerVision) => {
  if (!computerVision) {
    return {
      status: "NOT_AVAILABLE",
      faceDetection: {
        detected: false,
        detectionRate: 0,
      },
      faceVisibility: {
        averageVisibility: 0,
        observations: [],
      },
      gaze: {
        observations: [],
      },
      headMovement: {
        observations: [],
      },
      videoQuality: {
        brightness: 0,
        observations: [],
      },
      presence: {
        observations: [],
      },
      summary: "",
      analyzedAt: null,
      error: "",
    };
  }

  return {
    status: computerVision.status || "COMPLETED",

    faceDetection: {
      detected:
        Boolean(
          computerVision.faceDetection?.detected
        ),

      detectionRate:
        Number(
          computerVision.faceDetection?.detectionRate
        ) || 0,
    },

    faceVisibility: {
      averageVisibility:
        Number(
          computerVision.faceVisibility
            ?.averageVisibility
        ) || 0,

      observations:
        Array.isArray(
          computerVision.faceVisibility
            ?.observations
        )
          ? computerVision.faceVisibility.observations
          : [],
    },

    gaze: {
      observations:
        Array.isArray(
          computerVision.gaze?.observations
        )
          ? computerVision.gaze.observations
          : [],
    },

    headMovement: {
      observations:
        Array.isArray(
          computerVision.headMovement
            ?.observations
        )
          ? computerVision.headMovement.observations
          : [],
    },

    videoQuality: {
      brightness:
        Number(
          computerVision.videoQuality?.brightness
        ) || 0,

      observations:
        Array.isArray(
          computerVision.videoQuality
            ?.observations
        )
          ? computerVision.videoQuality.observations
          : [],
    },

    presence: {
      observations:
        Array.isArray(
          computerVision.presence?.observations
        )
          ? computerVision.presence.observations
          : [],
    },

    summary:
      computerVision.summary || "",

    analyzedAt:
      computerVision.analyzedAt || null,

    error:
      computerVision.error || "",
  };
};

// ============================================================
// POST /api/interviews/analysis/:applicationId
//
// Analyse complète d'un entretien :
// 1. Computer Vision
// 2. Transcription vidéo
// 3. Analyse Gemini
// 4. Sauvegarde du rapport
// ============================================================

const analyzeInterviewSession = async (req, res) => {
  try {
    console.log("\n========================================");
    console.log("🎯 ANALYSE COMPLÈTE DE L'ENTRETIEN");
    console.log("========================================");

    const { applicationId } = req.params;

    // ========================================================
    // 1. RÉCUPÉRER LA CANDIDATURE
    // ========================================================

    const application =
      await Application.findById(applicationId)
        .populate("jobId")
        .populate("candidateId");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Candidature introuvable.",
      });
    }

    console.log(
      "✅ Candidature trouvée :",
      application._id
    );

    // ========================================================
    // 2. RÉCUPÉRER L'ENTRETIEN
    // ========================================================

    const interview =
      await Interview.findOne({
        applicationId: application._id,
      });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Entretien introuvable.",
      });
    }

    console.log(
      "📌 Statut entretien :",
      interview.status
    );

    if (interview.status !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        message:
          "L'entretien doit être terminé avant de lancer l'analyse.",
      });
    }

    // ========================================================
    // 3. SI DÉJÀ ANALYSÉ
    // ========================================================

    if (
      interview.analysis?.status ===
      "COMPLETED"
    ) {
      console.log(
        "ℹ️ Entretien déjà analysé."
      );

      return res.status(200).json({
        success: true,

        message:
          "L'entretien a déjà été analysé.",

        interviewId:
          interview._id,

        video:
          interview.video,

        computerVision:
          buildComputerVisionReport(
            interview.computerVision
          ),

        transcription:
          interview.transcription,

        analysis:
          interview.analysis,
      });
    }

    // ========================================================
    // 4. VÉRIFIER LA VIDÉO
    // ========================================================

    if (
      !interview.video ||
      interview.video.status !== "UPLOADED" ||
      !interview.video.path
    ) {
      return res.status(400).json({
        success: false,
        message:
          "La vidéo de l'entretien n'est pas disponible pour l'analyse.",
      });
    }

    console.log(
      "🎥 Vidéo :",
      interview.video.path
    );

    // ========================================================
    // 5. RÉCUPÉRER LE CV
    // ========================================================

    const resume =
      await Resume.findOne({
        _id: application.resumeId,
      });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message:
          "CV du candidat introuvable.",
      });
    }

    console.log("📄 CV récupéré.");

    // ========================================================
    // 6. INITIALISER L'ANALYSE
    // ========================================================

    interview.analysis.status =
      "ANALYZING";

    interview.analysis.error = "";

    await interview.save();

    // ========================================================
    // ÉTAPE 1 — COMPUTER VISION
    // ========================================================

    console.log("\n----------------------------------------");
    console.log(
      "👁️ ÉTAPE 1 : COMPUTER VISION"
    );
    console.log("----------------------------------------");

    try {
      interview.computerVision.status =
        "ANALYZING";

      interview.computerVision.error = "";

      await interview.save();

      const computerVisionResult =
        await analyzeInterviewVideo(
          interview.video.path
        );

      // ------------------------------------------------------
      // Nettoyage / normalisation
      // ------------------------------------------------------

      const cleanComputerVisionResult =
        buildComputerVisionReport(
          computerVisionResult
        );

      interview.computerVision =
        cleanComputerVisionResult;

      await interview.save();

      console.log(
        "📊 Résultat Computer Vision :",
        JSON.stringify(
          cleanComputerVisionResult,
          null,
          2
        )
      );

      console.log(
        "✅ Computer Vision terminée."
      );
    } catch (computerVisionError) {
      console.error(
        "❌ Erreur Computer Vision :",
        computerVisionError.message
      );

      interview.computerVision = {
        status: "FAILED",

        faceDetection: {
          detected: false,
          detectionRate: 0,
        },

        faceVisibility: {
          averageVisibility: 0,
          observations: [],
        },

        gaze: {
          observations: [],
        },

        headMovement: {
          observations: [],
        },

        videoQuality: {
          brightness: 0,
          observations: [],
        },

        presence: {
          observations: [],
        },

        summary: "",

        analyzedAt: null,

        error:
          computerVisionError.message,
      };

      await interview.save();

      console.log(
        "⚠️ Le rapport continuera sans Computer Vision."
      );
    }

    // ========================================================
    // ÉTAPE 2 — TRANSCRIPTION
    // ========================================================

    console.log("\n----------------------------------------");
    console.log(
      "🎙️ ÉTAPE 2 : TRANSCRIPTION"
    );
    console.log("----------------------------------------");

    let transcriptionResult;

    if (
      interview.transcription?.status ===
        "COMPLETED" &&
      interview.transcription?.text
    ) {
      console.log(
        "ℹ️ Transcription déjà disponible."
      );

      transcriptionResult =
        interview.transcription;
    } else {
      interview.transcription.status =
        "TRANSCRIBING";

      interview.transcription.error = "";

      await interview.save();

      try {
        transcriptionResult =
          await transcribeInterviewVideo(
            interview.video.path,
            interview.video.mimeType
          );

        interview.transcription = {
          status: "COMPLETED",

          text:
            transcriptionResult.text || "",

          language:
            transcriptionResult.language ||
            "fr",

          transcribedAt:
            new Date(),

          error: "",
        };

        await interview.save();

        console.log(
          "✅ Transcription terminée."
        );
      } catch (transcriptionError) {
        console.error(
          "❌ Erreur transcription :",
          transcriptionError.message
        );

        interview.transcription.status =
          "FAILED";

        interview.transcription.error =
          transcriptionError.message;

        interview.analysis.status =
          "FAILED";

        interview.analysis.error =
          transcriptionError.message;

        await interview.save();

        return res.status(500).json({
          success: false,

          message:
            "Erreur lors de la transcription.",

          error:
            transcriptionError.message,
        });
      }
    }

    // ========================================================
    // VÉRIFIER TRANSCRIPTION
    // ========================================================

    const transcript =
      interview.transcription?.text || "";

    if (!transcript.trim()) {
      interview.analysis.status =
        "FAILED";

      interview.analysis.error =
        "La transcription est vide.";

      await interview.save();

      return res.status(400).json({
        success: false,

        message:
          "Impossible d'analyser l'entretien : transcription vide.",
      });
    }

    console.log(
      "📝 Longueur transcription :",
      transcript.length
    );

    // ========================================================
    // ÉTAPE 3 — ANALYSE GEMINI
    // ========================================================

    console.log("\n----------------------------------------");
    console.log(
      "🤖 ÉTAPE 3 : ANALYSE GEMINI"
    );
    console.log("----------------------------------------");

    let geminiAnalysis;

    try {
      geminiAnalysis =
        await analyzeInterviewConversation({
          jobTitle:
            application.jobId?.title ||
            "Poste non spécifié",

          jobDescription:
            application.jobId?.description ||
            "",

          candidateSkills:
            resume.skills?.technicalSkills ||
            [],

          resumeText:
            resume.rawText || "",

          transcript,
        });

      console.log(
        "✅ Analyse Gemini terminée."
      );
    } catch (geminiError) {
      console.error(
        "❌ Erreur analyse Gemini :",
        geminiError.message
      );

      interview.analysis.status =
        "FAILED";

      interview.analysis.error =
        geminiError.message;

      await interview.save();

      return res.status(500).json({
        success: false,

        message:
          "Erreur lors de l'analyse Gemini.",

        error:
          geminiError.message,
      });
    }

    // ========================================================
    // ÉTAPE 4 — SAUVEGARDE DU RAPPORT
    // ========================================================

    console.log("\n----------------------------------------");
    console.log(
      "💾 ÉTAPE 4 : SAUVEGARDE DU RAPPORT"
    );
    console.log("----------------------------------------");

    interview.analysis = {
      status: "COMPLETED",

      overallScore:
        Number(
          geminiAnalysis.overallScore
        ) || 0,

      technicalScore:
        Number(
          geminiAnalysis.technicalScore
        ) || 0,

      communicationScore:
        Number(
          geminiAnalysis.communicationScore
        ) || 0,

      relevanceScore:
        Number(
          geminiAnalysis.relevanceScore
        ) || 0,

      strengths:
        Array.isArray(
          geminiAnalysis.strengths
        )
          ? geminiAnalysis.strengths
          : [],

      weaknesses:
        Array.isArray(
          geminiAnalysis.weaknesses
        )
          ? geminiAnalysis.weaknesses
          : [],

      recommendations:
        Array.isArray(
          geminiAnalysis.recommendations
        )
          ? geminiAnalysis.recommendations
          : [],

      communicationObservations:
        Array.isArray(
          geminiAnalysis
            .communicationObservations
        )
          ? geminiAnalysis
              .communicationObservations
          : [],

      sentimentObservations:
        Array.isArray(
          geminiAnalysis
            .sentimentObservations
        )
          ? geminiAnalysis
              .sentimentObservations
          : [],

      resumeObservations:
        Array.isArray(
          geminiAnalysis
            .resumeObservations
        )
          ? geminiAnalysis
              .resumeObservations
          : [],

      summary:
        geminiAnalysis.summary || "",

      finalReportSummary:
        geminiAnalysis.finalReportSummary ||
        geminiAnalysis.summary ||
        "",

      analyzedAt:
        new Date(),

      error: "",
    };

    await interview.save();

    console.log(
      "✅ Rapport sauvegardé."
    );

    console.log(
      "👁️ Computer Vision sauvegardée :",
      interview.computerVision?.status
    );

    console.log(
      "========================================\n"
    );

    // ========================================================
    // RÉPONSE FINALE
    // ========================================================

    return res.status(200).json({
      success: true,

      message:
        "Analyse complète de l'entretien terminée.",

      interviewId:
        interview._id,

      video:
        interview.video,

      // IMPORTANT :
      // Le rapport contient maintenant explicitement
      // toute l'analyse Computer Vision.
      computerVision:
        buildComputerVisionReport(
          interview.computerVision
        ),

      transcription:
        interview.transcription,

      analysis:
        interview.analysis,
    });
  } catch (error) {
    console.error(
      "❌ ERREUR GÉNÉRALE ANALYSE ENTRETIEN :",
      error
    );

    try {
      if (req.params.applicationId) {
        const interview =
          await Interview.findOne({
            applicationId:
              req.params.applicationId,
          });

        if (interview) {
          interview.analysis.status =
            "FAILED";

          interview.analysis.error =
            error.message;

          await interview.save();
        }
      }
    } catch (saveError) {
      console.error(
        "❌ Impossible de sauvegarder l'erreur :",
        saveError.message
      );
    }

    return res.status(500).json({
      success: false,

      message:
        "Erreur lors de l'analyse de l'entretien.",

      error: error.message,
    });
  }
};

// ============================================================
// GET /api/interviews/analysis/:applicationId
//
// Retourne le rapport complet.
// ============================================================

const getInterviewAnalysis = async (
  req,
  res
) => {
  try {
    const { applicationId } =
      req.params;

    const interview =
      await Interview.findOne({
        applicationId,
      });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message:
          "Entretien introuvable.",
      });
    }

    if (
      interview.analysis?.status !==
      "COMPLETED"
    ) {
      return res.status(400).json({
        success: false,

        message:
          "L'analyse de l'entretien n'est pas encore disponible.",

        status:
          interview.analysis?.status ||
          "NOT_ANALYZED",
      });
    }

    return res.status(200).json({
      success: true,

      interviewId:
        interview._id,

      status:
        interview.status,

      video:
        interview.video,

      // IMPORTANT :
      // Toujours renvoyer la Computer Vision
      // même lorsqu'on récupère un rapport existant.
      computerVision:
        buildComputerVisionReport(
          interview.computerVision
        ),

      transcription:
        interview.transcription,

      analysis:
        interview.analysis,
    });
  } catch (error) {
    console.error(
      "❌ Erreur récupération rapport :",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Erreur lors de la récupération du rapport.",

      error: error.message,
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  analyzeInterviewSession,
  getInterviewAnalysis,
};