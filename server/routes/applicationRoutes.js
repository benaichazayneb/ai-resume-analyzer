const express = require("express");

const {
  createApplication,
  getMyApplications,
  getApplicationById,
  getApplicationsByJob,
  runMatchingForJob,
  updateApplicationStatus,
  sendInterviewInvitation,
} = require("../controllers/applicationController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Candidate
router.post("/", protect, createApplication);
router.get("/my", protect, getMyApplications);

// Recruiter: consulter les candidatures
router.get("/job/:jobId", protect, getApplicationsByJob);

// Recruiter: lancer le matching
router.post(
  "/job/:jobId/matching",
  protect,
  runMatchingForJob
);

// Recruiter: retenir ou refuser
router.patch(
  "/:id/status",
  protect,
  updateApplicationStatus
);

// Recruiter: envoyer une invitation
router.post(
  "/:id/interview-invitation",
  protect,
  sendInterviewInvitation
);

// Détails d'une candidature
router.get("/:id", protect, getApplicationById);

module.exports = router;