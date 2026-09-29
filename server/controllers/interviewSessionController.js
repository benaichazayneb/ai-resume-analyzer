const jwt = require("jsonwebtoken");

const Application = require("../models/Application");
const Interview = require("../models/Interview");
const Resume = require("../models/Resume");

const {
  generateNextInterviewQuestion,
} = require("../services/interviewAIService");

// ============================================================
// CONSTANTES
// ============================================================

const MAX_QUESTIONS = 3;

// ============================================================
// RÉCUPÉRER L'ENTRETIEN À PARTIR DU TOKEN
// ============================================================

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
  )
    .populate("jobId")
    .populate("candidateId", "name email");

  if (!application) {
    throw new Error("APPLICATION_NOT_FOUND");
  }

  const interview = await Interview.findOne({
    applicationId: application._id,
  });

  if (!interview) {
    throw new Error("INTERVIEW_NOT_FOUND");
  }

  return {
    application,
    interview,
  };
};

// ============================================================
// RÉCUPÉRER LA QUESTION COURANTE
// ============================================================

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

// ============================================================
// CONSTRUIRE L'HISTORIQUE DE LA CONVERSATION
// ============================================================

const buildConversation = (interview) => {
  return interview.questions.map((item) => ({
    question: item.question,
    type: item.type,
    skill: item.skill,
    answer: item.answer || "",
  }));
};

// ============================================================
// GESTION DES ERREURS TOKEN
// ============================================================

const handleTokenError = (error, res) => {
  if (
    error.name === "TokenExpiredError" ||
    error.name === "JsonWebTokenError" ||
    error.message === "INVALID_INTERVIEW_TOKEN"
  ) {
    return res.status(401).json({
      message: "Lien invalide ou expiré.",
    });
  }

  return null;
};

// ============================================================
// RÉCUPÉRER / REPRENDRE L'ENTRETIEN
// ============================================================

exports.getInterviewSession = async (req, res) => {
  try {
    const { application, interview } =
      await getInterviewFromToken(req.params.token);

    if (
      ![
        "INTERVIEW_INVITED",
        "INTERVIEW_COMPLETED",
      ].includes(application.status)
    ) {
      return res.status(403).json({
        message: "Cet entretien n'est pas accessible.",
      });
    }

    return res.status(200).json({
      status: interview.status,
      currentQuestion: getCurrentQuestion(interview),
      questionCount: interview.questions.length,
      maxQuestions: MAX_QUESTIONS,
    });
  } catch (error) {
    const tokenResponse = handleTokenError(error, res);

    if (tokenResponse) {
      return tokenResponse;
    }

    if (
      error.message === "APPLICATION_NOT_FOUND" ||
      error.message === "INTERVIEW_NOT_FOUND"
    ) {
      return res.status(404).json({
        message: "Entretien introuvable.",
      });
    }

    console.error(
      "getInterviewSession:",
      error
    );

    return res.status(500).json({
      message: "Erreur serveur.",
    });
  }
};

// ============================================================
// ENREGISTRER LA RÉPONSE ET GÉNÉRER LA QUESTION SUIVANTE
// ============================================================

exports.submitInterviewAnswer = async (req, res) => {
  try {
    const { application, interview } =
      await getInterviewFromToken(req.params.token);

    // --------------------------------------------------------
    // Vérifier la candidature
    // --------------------------------------------------------

    if (
      application.status !== "INTERVIEW_INVITED"
    ) {
      return res.status(403).json({
        message:
          "Cet entretien n'est plus en cours.",
      });
    }

    // --------------------------------------------------------
    // Vérifier le statut de l'entretien
    // --------------------------------------------------------

    if (interview.status === "COMPLETED") {
      return res.status(400).json({
        message:
          "L'entretien est déjà terminé.",
      });
    }

    // --------------------------------------------------------
    // Récupérer la réponse
    // --------------------------------------------------------

    const { answer } = req.body;

    if (
      typeof answer !== "string" ||
      !answer.trim()
    ) {
      return res.status(400).json({
        message:
          "Veuillez fournir une réponse.",
      });
    }

    if (answer.length > 10000) {
      return res.status(400).json({
        message:
          "La réponse est trop longue.",
      });
    }

    // --------------------------------------------------------
    // Vérifier qu'une question existe
    // --------------------------------------------------------

    const currentIndex =
      interview.currentQuestionIndex;

    if (
      currentIndex >= interview.questions.length
    ) {
      return res.status(400).json({
        message:
          "Aucune question en attente.",
      });
    }

    // --------------------------------------------------------
    // Sauvegarder la réponse
    // --------------------------------------------------------

    interview.questions[currentIndex].answer =
      answer.trim();

    // --------------------------------------------------------
    // Incrémenter l'index
    // --------------------------------------------------------

    interview.currentQuestionIndex =
      currentIndex + 1;

    // --------------------------------------------------------
    // Vérifier la limite maximale
    // --------------------------------------------------------

    if (
      interview.currentQuestionIndex >=
      MAX_QUESTIONS
    ) {
      interview.status = "COMPLETED";
      interview.completedAt = new Date();

      application.status =
        "INTERVIEW_COMPLETED";

      await interview.save();
      await application.save();

      return res.status(200).json({
        message:
          "Entretien terminé.",
        status: interview.status,
        currentQuestion: null,
      });
    }

    // --------------------------------------------------------
    // Récupérer le CV
    // --------------------------------------------------------

    const resume = await Resume.findById(
      application.resumeId
    );

    if (!resume) {
      return res.status(404).json({
        message:
          "CV du candidat introuvable.",
      });
    }

    // --------------------------------------------------------
    // Construire l'historique
    // --------------------------------------------------------

    const conversation =
      buildConversation(interview);

    // --------------------------------------------------------
    // Demander à Gemini une nouvelle question
    // --------------------------------------------------------

    const nextQuestion =
      await generateNextInterviewQuestion({
        jobTitle:
          application.jobId?.title || "",

        jobDescription:
          application.jobId?.description || "",

        candidateSkills:
          resume.skills?.technicalSkills || [],

        resumeText:
          resume.rawText || "",

        conversation,

        questionNumber:
          interview.currentQuestionIndex + 1,

        maxQuestions: MAX_QUESTIONS,
      });

    // --------------------------------------------------------
    // Vérifier la réponse Gemini
    // --------------------------------------------------------

    if (
      !nextQuestion ||
      !nextQuestion.question
    ) {
      throw new Error(
        "GEMINI_QUESTION_GENERATION_FAILED"
      );
    }

    // --------------------------------------------------------
    // Ajouter la nouvelle question
    // --------------------------------------------------------

    interview.questions.push({
      question:
        nextQuestion.question.trim(),

      type:
        nextQuestion.type || "BEHAVIORAL",

      skill:
        nextQuestion.skill || "",

      answer: "",
    });

    await interview.save();

    // --------------------------------------------------------
    // Retourner la nouvelle question
    // --------------------------------------------------------

    return res.status(200).json({
      message:
        "Réponse enregistrée. Nouvelle question générée.",

      status:
        interview.status,

      currentQuestion:
        getCurrentQuestion(interview),

      questionCount:
        interview.questions.length,

      maxQuestions:
        MAX_QUESTIONS,
    });
  } catch (error) {
    const tokenResponse =
      handleTokenError(error, res);

    if (tokenResponse) {
      return tokenResponse;
    }

    if (
      error.message ===
        "APPLICATION_NOT_FOUND" ||
      error.message ===
        "INTERVIEW_NOT_FOUND"
    ) {
      return res.status(404).json({
        message:
          "Entretien introuvable.",
      });
    }

    if (
      error.message ===
      "GEMINI_QUESTION_GENERATION_FAILED"
    ) {
      console.error(
        "Gemini n'a pas généré de question :",
        error
      );

      return res.status(500).json({
        message:
          "Impossible de générer la prochaine question.",
      });
    }

    console.error(
      "submitInterviewAnswer:",
      error
    );

    return res.status(500).json({
      message:
        "Erreur lors du traitement de la réponse.",
      error: error.message,
    });
  }
};

// ============================================================
// DÉMARRER L'ENTRETIEN
// ============================================================

exports.startInterview = async (req, res) => {
  try {
    const { token } = req.params;

    // --------------------------------------------------------
    // Vérifier le token
    // --------------------------------------------------------

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (
      decoded.type !== "INTERVIEW" ||
      !decoded.applicationId
    ) {
      return res.status(401).json({
        message:
          "Invitation invalide.",
      });
    }

    // --------------------------------------------------------
    // Récupérer la candidature
    // --------------------------------------------------------

    const application =
      await Application.findById(
        decoded.applicationId
      )
        .populate("jobId")
        .populate(
          "candidateId",
          "name email"
        );

    if (!application) {
      return res.status(404).json({
        message:
          "Candidature introuvable.",
      });
    }

    // --------------------------------------------------------
    // Vérifier le statut
    // --------------------------------------------------------

    if (
      application.status !==
      "INTERVIEW_INVITED"
    ) {
      return res.status(403).json({
        message:
          "Cette candidature ne peut pas démarrer l'entretien.",
      });
    }

    // --------------------------------------------------------
    // Vérifier si une session existe déjà
    // --------------------------------------------------------

    let interview = await Interview.findOne({
      applicationId: application._id,
    });

    // Si une session existe déjà et est en cours,
    // on la reprend.
    if (interview && interview.status === "IN_PROGRESS") {
      return res.status(200).json({
        message: "Session récupérée.",
        status: interview.status,
        currentQuestion: getCurrentQuestion(interview),
        questionCount: interview.questions.length,
        maxQuestions: MAX_QUESTIONS,
      });
    }

    // Si une ancienne session est terminée,
    // on la supprime pour permettre un nouvel entretien.
    if (interview && interview.status === "COMPLETED") {
      await Interview.deleteOne({
        _id: interview._id,
      });

      interview = null;
    }

    // --------------------------------------------------------
    // Récupérer le CV
    // --------------------------------------------------------

    const resume =
      await Resume.findById(
        application.resumeId
      );

    if (!resume) {
      return res.status(404).json({
        message:
          "CV introuvable.",
      });
    }

    // --------------------------------------------------------
    // Générer UNIQUEMENT la première question
    // --------------------------------------------------------

    const firstQuestion =
      await generateNextInterviewQuestion({
        jobTitle:
          application.jobId?.title || "",

        jobDescription:
          application.jobId?.description || "",

        candidateSkills:
          resume.skills?.technicalSkills || [],

        resumeText:
          resume.rawText || "",

        conversation: [],

        questionNumber: 1,

        maxQuestions: MAX_QUESTIONS,
      });

    if (
      !firstQuestion ||
      !firstQuestion.question
    ) {
      throw new Error(
        "GEMINI_FIRST_QUESTION_FAILED"
      );
    }

    // --------------------------------------------------------
    // Créer la session
    // --------------------------------------------------------

    interview =
      await Interview.create({
        applicationId:
          application._id,

        questions: [
          {
            question:
              firstQuestion.question.trim(),

            type:
              firstQuestion.type ||
              "EXPERIENCE",

            skill:
              firstQuestion.skill || "",

            answer: "",
          },
        ],

        currentQuestionIndex: 0,

        status: "IN_PROGRESS",

        startedAt: new Date(),
      });

    // --------------------------------------------------------
    // Réponse
    // --------------------------------------------------------

    return res.status(201).json({
      message:
        "Entretien démarré.",

      status:
        interview.status,

      currentQuestion:
        getCurrentQuestion(interview),

      questionCount:
        interview.questions.length,

      maxQuestions:
        MAX_QUESTIONS,
    });
  } catch (error) {
    const tokenResponse =
      handleTokenError(error, res);

    if (tokenResponse) {
      return tokenResponse;
    }

    if (
      error.message ===
      "GEMINI_FIRST_QUESTION_FAILED"
    ) {
      console.error(
        "Gemini n'a pas généré la première question :",
        error
      );

      return res.status(500).json({
        message:
          "Impossible de préparer l'entretien IA.",
      });
    }

    console.error(
      "Erreur startInterview:",
      error
    );

    return res.status(500).json({
      message:
        "Erreur lors du démarrage de l'entretien.",
      error: error.message,
    });
  }
};
// ============================================================
// UPLOAD DE LA VIDÉO DE L'ENTRETIEN
// ============================================================

exports.uploadInterviewVideo = async (
  req,
  res
) => {
  try {
    const {
      application,
      interview,
    } = await getInterviewFromToken(
      req.params.token
    );

    // --------------------------------------------------------
    // Vérifier la candidature
    // --------------------------------------------------------

    if (
      ![
        "INTERVIEW_INVITED",
        "INTERVIEW_COMPLETED",
      ].includes(application.status)
    ) {
      return res.status(403).json({
        message:
          "Cet entretien n'est pas accessible.",
      });
    }

    // --------------------------------------------------------
    // Vérifier le fichier
    // --------------------------------------------------------

    console.log("🎥 Fichier reçu :", {
      filename: req.file?.filename,
      mimetype: req.file?.mimetype,
      size: req.file?.size,
      path: req.file?.path,
    });

    if (!req.file) {
      return res.status(400).json({
        message: "Aucune vidéo n'a été envoyée.",
      });
    }

    // --------------------------------------------------------
    // Sauvegarder les informations
    // --------------------------------------------------------

    interview.video = {
      status: "UPLOADED",

      filename:
        req.file.filename,

      path:
        req.file.path,

      mimeType:
        req.file.mimetype,

      size:
        req.file.size,

      duration:
        Number(req.body.duration) || 0,

      uploadedAt:
        new Date(),
    };

    await interview.save();

    return res.status(200).json({
      message:
        "Vidéo de l'entretien enregistrée.",

      video: {
        filename:
          interview.video.filename,

        mimeType:
          interview.video.mimeType,

        size:
          interview.video.size,

        duration:
          interview.video.duration,

        uploadedAt:
          interview.video.uploadedAt,
      },
    });
  } catch (error) {
    const tokenResponse =
      handleTokenError(error, res);

    if (tokenResponse) {
      return tokenResponse;
    }

    if (
      error.message ===
        "APPLICATION_NOT_FOUND" ||
      error.message ===
        "INTERVIEW_NOT_FOUND"
    ) {
      return res.status(404).json({
        message:
          "Entretien introuvable.",
      });
    }

    console.error(
      "Erreur uploadInterviewVideo:",
      error
    );

    return res.status(500).json({
      message:
        "Erreur lors de l'enregistrement de la vidéo.",
      error: error.message,
    });
  }
};