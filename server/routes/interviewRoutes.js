const express = require("express");

const router = express.Router();

const {
  getInterview,
} = require("../controllers/interviewController");

const {
  startInterview,
  getInterviewSession,
  submitInterviewAnswer,
} = require("../controllers/interviewSessionController");

const {
  analyzeInterviewSession,
  getInterviewAnalysis,
} = require("../controllers/interviewAnalysisController");

// =====================================================
// ANALYSE IA DE L'ENTRETIEN
// =====================================================

// Lancer l'analyse IA d'un entretien terminé
router.post(
  "/analysis/:applicationId",
  analyzeInterviewSession
);

// Récupérer l'analyse IA
router.get(
  "/analysis/:applicationId",
  getInterviewAnalysis
);

// =====================================================
// ENTRETIEN
// =====================================================

// Vérifier l'invitation
router.get("/:token", getInterview);

// Démarrer l'entretien IA
router.post("/:token/start", startInterview);

// Récupérer la question courante
router.get("/:token/session", getInterviewSession);

// Enregistrer une réponse et passer à la suivante
router.post("/:token/answer", submitInterviewAnswer);

module.exports = router;