const Analysis = require("../models/Analysis");

// GET /api/analysis
const getAnalyses = async (req, res, next) => {
  try {
    const analyses = await Analysis.find({
      userId: req.user._id,
    })
      .populate("resumeId", "fileName")
      .populate("jobDescriptionId", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: analyses.length,
      data: analyses,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analysis/:id
const getAnalysisById = async (req, res, next) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })
      .populate("resumeId", "fileName")
      .populate("jobDescriptionId", "title");

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalyses,
  getAnalysisById,
};