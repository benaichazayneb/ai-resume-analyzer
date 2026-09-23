const jwt = require("jsonwebtoken");
const Application = require("../models/Application");

exports.getInterview = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        message: "Token manquant.",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "JWT_SECRET n'est pas configuré.",
      });
    }

    // Vérifier le token de l'invitation
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "INTERVIEW" || !decoded.applicationId) {
      return res.status(401).json({
        message: "Lien d'entretien invalide.",
      });
    }

    const application = await Application.findById(
      decoded.applicationId
    )
      .populate("jobId", "title description")
      .populate("candidateId", "name email");

    if (!application) {
      return res.status(404).json({
        message: "Candidature introuvable.",
      });
    }

    if (
      !["INTERVIEW_INVITED", "INTERVIEW_COMPLETED"].includes(
        application.status
      )
    ) {
      return res.status(403).json({
        message: "Cette candidature ne permet pas de démarrer l'entretien.",
      });
    }

    return res.status(200).json({
      message: "Invitation valide.",
      application: {
        id: application._id,
        status: application.status,
        job: application.jobId,
        candidate: application.candidateId,
      },
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

    console.error("Erreur getInterview:", error);

    return res.status(500).json({
      message: "Erreur serveur.",
    });
  }
};