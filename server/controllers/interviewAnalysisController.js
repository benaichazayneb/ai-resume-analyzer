const jwt = require("jsonwebtoken");

const Application = require("../models/Application");
const Interview = require("../models/Interview");
const Resume = require("../models/Resume");

const {
  analyzeInterview,
} = require("../services/interviewAIService");

// =====================================================
// Analyser un entretien terminé
// =====================================================

exports.analyzeInterviewSession = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // -------------------------------------------------
    // 1. Vérifier que la candidature existe
    // -------------------------------------------------

    const application = await Application.findById(applicationId)
      .populate("jobId")
      .populate("candidateId", "name email");

    if (!application) {
      return res.status(404).json({
        message: "Candidature introuvable.",
      });
    }

    // -------------------------------------------------
    // 2. Vérifier que l'entretien existe
    // -------------------------------------------------

    const interview = await Interview.findOne({
      applicationId: application._id,
    });

    if (!interview) {
      return res.status(404).json({
        message: "Entretien introuvable.",
      });
    }

    // -------------------------------------------------
    // 3. Vérifier que l'entretien est terminé
    // -------------------------------------------------

    if (interview.status !== "COMPLETED") {
      return res.status(400).json({
        message:
          "L'entretien doit être terminé avant de pouvoir être analysé.",
      });
    }

    // -------------------------------------------------
    // 4. Vérifier si une analyse existe déjà
    // -------------------------------------------------

    if (
      interview.analysis &&
      interview.analysis.status === "COMPLETED"
    ) {
      return res.status(200).json({
        message: "L'entretien a déjà été analysé.",
        analysis: interview.analysis,
      });
    }

    // -------------------------------------------------
    // 5. Récupérer le CV
    // -------------------------------------------------

    const resume = await Resume.findById(
      application.resumeId
    );

    if (!resume) {
      return res.status(404).json({
        message: "CV du candidat introuvable.",
      });
    }

    // -------------------------------------------------
    // 6. Vérifier qu'il y a des réponses
    // -------------------------------------------------

    const answeredQuestions = interview.questions.filter(
      (question) =>
        typeof question.answer === "string" &&
        question.answer.trim().length > 0
    );

    if (answeredQuestions.length === 0) {
      return res.status(400).json({
        message:
          "Aucune réponse n'a été enregistrée pour cet entretien.",
      });
    }

    // -------------------------------------------------
    // 7. Marquer l'analyse comme en cours
    // -------------------------------------------------

    interview.analysis.status = "ANALYZING";

    await interview.save();

    // -------------------------------------------------
    // 8. Appeler Gemini
    // -------------------------------------------------

    const analysis = await analyzeInterview({
      jobTitle: application.jobId?.title || "",
      jobDescription: application.jobId?.description || "",

      candidateSkills:
        resume.skills?.technicalSkills || [],

      resumeText:
        resume.rawText || "",

      questions: interview.questions.map((question) => ({
        question: question.question,
        type: question.type,
        skill: question.skill,
        answer: question.answer,
      })),
    });

    // -------------------------------------------------
    // 9. Enregistrer l'analyse
    // -------------------------------------------------

    interview.analysis = {
      status: "COMPLETED",

      overallScore: analysis.overallScore,

      technicalScore: analysis.technicalScore,

      communicationScore:
        analysis.communicationScore,

      relevanceScore:
        analysis.relevanceScore,

      strengths:
        analysis.strengths || [],

      weaknesses:
        analysis.weaknesses || [],

      recommendations:
        analysis.recommendations || [],

      summary:
        analysis.summary || "",

      analyzedAt: new Date(),
    };

    await interview.save();

    // -------------------------------------------------
    // 10. Retourner le résultat
    // -------------------------------------------------

    return res.status(200).json({
      message: "Analyse de l'entretien terminée.",
      analysis: interview.analysis,
    });
  } catch (error) {
    console.error(
      "Erreur analyzeInterviewSession:",
      error
    );

    // -------------------------------------------------
    // Si Gemini échoue
    // -------------------------------------------------

    if (req.params.applicationId) {
      try {
        await Interview.findOneAndUpdate(
          {
            applicationId: req.params.applicationId,
          },
          {
            $set: {
              "analysis.status": "FAILED",
            },
          }
        );
      } catch (updateError) {
        console.error(
          "Erreur mise à jour statut analyse:",
          updateError
        );
      }
    }

    return res.status(500).json({
      message:
        "Erreur lors de l'analyse de l'entretien.",
      error: error.message,
    });
  }
};

// =====================================================
// Récupérer l'analyse d'un entretien
// =====================================================

exports.getInterviewAnalysis = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // -------------------------------------------------
    // Récupérer l'entretien
    // -------------------------------------------------

    const interview = await Interview.findOne({
      applicationId,
    });

    if (!interview) {
      return res.status(404).json({
        message: "Entretien introuvable.",
      });
    }

    // -------------------------------------------------
    // Vérifier que l'analyse existe
    // -------------------------------------------------

    if (
      !interview.analysis ||
      interview.analysis.status !== "COMPLETED"
    ) {
      return res.status(404).json({
        message:
          "L'analyse de cet entretien n'est pas encore disponible.",
      });
    }

    return res.status(200).json({
      analysis: interview.analysis,
    });
  } catch (error) {
    console.error(
      "Erreur getInterviewAnalysis:",
      error
    );

    return res.status(500).json({
      message:
        "Erreur lors de la récupération de l'analyse.",
    });
  }
};