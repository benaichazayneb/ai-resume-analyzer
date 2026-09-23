const JobDescription = require("../models/JobDescription");
const { analyzeText } = require("../services/mlService");

const createJobDescription = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Job title is required",
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Job description is required",
      });
    }

    console.log(`💼 Analyzing job description: ${title}`);

    const mlResult = await analyzeText(description.trim());

    console.log("✅ Job description NLP analysis completed");

    const technicalSkills = mlResult.data?.technicalSkills || [];
    const softSkills = mlResult.data?.softSkills || [];

    console.log(`🔧 Technical skills detected: ${technicalSkills.length}`);
    console.log(`🤝 Soft skills detected: ${softSkills.length}`);

    const jobDescription = await JobDescription.create({
      userId: req.user._id,
      title: title.trim(),
      description: description.trim(),

      extractedSkills: {
        requiredSkills: technicalSkills,
        preferredSkills: [],
      },

      experienceRequirements: "",
      educationRequirements: "",

      keywords: softSkills,

      status: "DRAFT",
      publishedAt: null,
    });

    res.status(201).json({
      success: true,
      message: "Job description created successfully",

      data: {
        id: jobDescription._id,
        title: jobDescription.title,
        description: jobDescription.description,

        extractedSkills: {
          requiredSkills: jobDescription.extractedSkills.requiredSkills,
          preferredSkills: jobDescription.extractedSkills.preferredSkills,
        },

        experienceRequirements: jobDescription.experienceRequirements,
        educationRequirements: jobDescription.educationRequirements,
        keywords: jobDescription.keywords,

        status: jobDescription.status,
        publishedAt: jobDescription.publishedAt,

        createdAt: jobDescription.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ Job description creation error:", error.message);
    next(error);
  }
};

const getJobDescriptions = async (req, res, next) => {
  try {
    let jobs;

    if (req.user.role === "RECRUITER") {
      jobs = await JobDescription.find({
        userId: req.user._id,
      }).sort({ createdAt: -1 });
    } else {
      jobs = await JobDescription.find({
        status: "PUBLISHED",
      }).sort({ publishedAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    console.error("❌ Error retrieving job descriptions:", error.message);
    next(error);
  }
};

const getJobDescriptionById = async (req, res, next) => {
  try {
    let job;

    if (req.user.role === "RECRUITER") {
      job = await JobDescription.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });
    } else {
      job = await JobDescription.findOne({
        _id: req.params.id,
        status: "PUBLISHED",
      });
    }

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job description not found",
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("❌ Error retrieving job description:", error.message);
    next(error);
  }
};

const publishJobDescription = async (req, res, next) => {
  try {
    const job = await JobDescription.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job description not found",
      });
    }

    if (job.status === "PUBLISHED") {
      return res.status(400).json({
        success: false,
        message: "Job description is already published",
      });
    }

    if (job.status === "CLOSED") {
      return res.status(400).json({
        success: false,
        message: "A closed job cannot be published",
      });
    }

    job.status = "PUBLISHED";
    job.publishedAt = new Date();

    await job.save();

    res.status(200).json({
      success: true,
      message: "Job description published successfully",
      data: job,
    });
  } catch (error) {
    console.error("❌ Error publishing job:", error.message);
    next(error);
  }
};

const closeJobDescription = async (req, res, next) => {
  try {
    const job = await JobDescription.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job description not found",
      });
    }

    if (job.status === "CLOSED") {
      return res.status(400).json({
        success: false,
        message: "Job description is already closed",
      });
    }

    job.status = "CLOSED";

    await job.save();

    res.status(200).json({
      success: true,
      message: "Job description closed successfully",
      data: job,
    });
  } catch (error) {
    console.error("❌ Error closing job:", error.message);
    next(error);
  }
};

module.exports = {
  createJobDescription,
  getJobDescriptions,
  getJobDescriptionById,
  publishJobDescription,
  closeJobDescription,
};