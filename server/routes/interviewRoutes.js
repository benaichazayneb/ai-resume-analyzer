const express = require("express");

const router = express.Router();

const {
  getInterview,
} = require("../controllers/interviewController");

const {
  startInterview,
  getInterviewSession,
  submitInterviewAnswer,
  uploadInterviewVideo,
} = require("../controllers/interviewSessionController");

const {
  analyzeInterviewSession,
  getInterviewAnalysis,
} = require("../controllers/interviewAnalysisController");

const uploadInterviewVideoMiddleware =
  require("../middleware/interviewUpload");

// ============================================================
// ANALYSE
// ============================================================

router.post(
  "/analysis/:applicationId",
  analyzeInterviewSession
);

router.get(
  "/analysis/:applicationId",
  getInterviewAnalysis
);

// ============================================================
// ENTRETIEN
// ============================================================

router.get("/:token",getInterview);

router.post(
  "/:token/start",
  startInterview
);

router.get(
  "/:token/session",
  getInterviewSession
);

router.post(
  "/:token/answer",
  submitInterviewAnswer
);

// ============================================================
// VIDÉO
// ============================================================

router.post(
  "/:token/video",
  uploadInterviewVideoMiddleware.single(
    "video"
  ),
  uploadInterviewVideo
);

module.exports = router;