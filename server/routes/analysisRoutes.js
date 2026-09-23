const express = require("express");

const {
  getAnalyses,
  getAnalysisById,
} = require("../controllers/analysisController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getAnalyses);
router.get("/:id", protect, getAnalysisById);

module.exports = router;