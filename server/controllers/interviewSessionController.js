const jwt = require("jsonwebtoken");

const Application = require("../models/Application");
const Interview = require("../models/Interview");
const Resume = require("../models/Resume");

const {
  generateInterviewQuestions,
} = require("../services/interviewAIService");


const getInterviewFromToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (
    decoded.type !== "INTERVIEW" ||
    !decoded.applicationId
  ) {
    throw new Error("INVALID_INTERVIEW_TOKEN");
  }

  const application = await Application.findById(
    decoded.applicationId
  );

  if (!application) {
    throw new Error("APPLICATION_NOT_FOUND");
  }

  const interview = await Interview.findOne({
    applicationId: application._id,
  });

  if (!interview) {
    throw new Error("INTERVIEW_NOT_FOUND");
  }

  return { application, interview };
};

// Renvoyer uniquement la question courante
const getCurrentQuestion = (interview) => {
  const index = interview.currentQuestionIndex;

  if (
    interview.status === "COMPLETED" ||
    index >= interview.questions.length
  ) {
    return null;
  }

  const question = interview.questions[index];

  return {
    index,
    total: interview.questions.length,
    question: question.question,
    type: question.type,
    skill: question.skill,
    answer: question.answer || "",
  };
};

// Récupérer ou reprendre l'entretien
exports.getInterviewSession = async (req, res) => {
  try {
    const { application, interview } =
      await getInterviewFromToken(req.params.token);

    if (
      !["INTERVIEW_INVITED", "INTERVIEW_COMPLETED"].includes(
        application.status
      )
    ) {
      return res.status(403).json({
        message: "Cet entretien n'est pas accessible.",
      });
    }

    return res.status(200).json({
      status: interview.status,
      currentQuestion: getCurrentQuestion(interview),
    });
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.message === "INVALID_INTERVIEW_TOKEN"
    ) {
      return res.status(401).json({
        message: "Lien invalide ou expiré.",
      });
    }

    if (
      error.message === "APPLICATION_NOT_FOUND" ||
      error.message === "INTERVIEW_NOT_FOUND"
    ) {
      return res.status(404).json({
        message: "Entretien introuvable.",
      });
    }

    console.error("getInterviewSession:", error);

    return res.status(500).json({
      message: "Erreur serveur.",
    });
  }
};

// Enregistrer une réponse et passer à la question suivante
exports.submitInterviewAnswer = async (req, res) => {
  try {
    const { application, interview } =
      await getInterviewFromToken(req.params.token);

    if (application.status !== "INTERVIEW_INVITED") {
      return res.status(403).json({
        message: "Cet entretien n'est plus en cours.",
      });
    }

    if (interview.status === "COMPLETED") {
      return res.status(400).json({
        message: "L'entretien est déjà terminé.",
      });
    }

    const { answer } = req.body;

    if (typeof answer !== "string" || !answer.trim()) {
      return res.status(400).json({
        message: "Veuillez saisir une réponse.",
      });
    }

    if (answer.length > 10000) {
      return res.status(400).json({
        message: "La réponse est trop longue.",
      });
    }

    const index = interview.currentQuestionIndex;

    if (index >= interview.questions.length) {
      return res.status(400).json({
        message: "Aucune question restante.",
      });
    }

    // Sauvegarder la réponse actuelle
    interview.questions[index].answer = answer.trim();

    // Passer à la question suivante
    interview.currentQuestionIndex += 1;

    // Vérifier si c'était la dernière question
    if (
      interview.currentQuestionIndex >=
      interview.questions.length
    ) {
      interview.status = "COMPLETED";
      interview.completedAt = new Date();

      application.status = "INTERVIEW_COMPLETED";
      await application.save();
    }

    await interview.save();

    if (interview.status === "COMPLETED") {
    application.status = "INTERVIEW_COMPLETED";
    await application.save();
    }

    return res.status(200).json({
      message:
        interview.status === "COMPLETED"
          ? "Entretien terminé."
          : "Réponse enregistrée.",
      status: interview.status,
      currentQuestion: getCurrentQuestion(interview),
    });
    } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.message === "INVALID_INTERVIEW_TOKEN"
    ) {
      return res.status(401).json({
        message: "Lien invalide ou expiré.",
      });
    }

    if (
      error.message === "APPLICATION_NOT_FOUND" ||
      error.message === "INTERVIEW_NOT_FOUND"
    ) {
      return res.status(404).json({
        message: "Entretien introuvable.",
      });
    }

    console.error("submitInterviewAnswer:", error);

    return res.status(500).json({
      message: "Erreur lors de l'enregistrement de la réponse.",
    });
  }
};

exports.startInterview = async (req, res) => {
  try {
    const { token } = req.params;

    // 1. Vérifier le token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (
      decoded.type !== "INTERVIEW" ||
      !decoded.applicationId
    ) {
      return res.status(401).json({
        message: "Invitation invalide.",
      });
    }

    // 2. Récupérer la candidature
    const application = await Application.findById(
      decoded.applicationId
    )
      .populate("jobId")
      .populate("candidateId", "name email");

    if (!application) {
      return res.status(404).json({
        message: "Candidature introuvable.",
      });
    }

    if (application.status !== "INTERVIEW_INVITED") {
      return res.status(403).json({
        message: "Cette candidature ne peut pas démarrer l'entretien.",
      });
    }

    // 3. Vérifier si une session existe déjà
    let interview = await Interview.findOne({
      applicationId: application._id,
    });

    if (interview) {
    return res.status(200).json({
        message: "Session récupérée.",
        status: interview.status,
        currentQuestion: getCurrentQuestion(interview),
    });
    }

    // 4. Récupérer le CV
    const resume = await Resume.findById(
      application.resumeId
    );

    if (!resume) {
      return res.status(404).json({
        message: "CV introuvable.",
      });
    }

    // 5. Générer les questions IA
    const questions = await generateInterviewQuestions({
      jobTitle: application.jobId.title,
      jobDescription: application.jobId.description,
      candidateSkills:
        resume.skills?.technicalSkills || [],
      resumeText: resume.rawText || "",
    });

    // 6. Enregistrer la session
    interview = await Interview.create({
      applicationId: application._id,
      questions,
      status: "IN_PROGRESS",
      startedAt: new Date(),
    });

    return res.status(201).json({
    message: "Entretien démarré.",
    status: interview.status,
    currentQuestion: getCurrentQuestion(interview),
    });
    } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        message: "Lien invalide ou expiré.",
      });
    }

    console.error("Erreur startInterview:", error);

    return res.status(500).json({
      message: "Erreur lors du démarrage de l'entretien.",
    });
  }
};