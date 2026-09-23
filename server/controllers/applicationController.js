
const mongoose = require("mongoose");

const Application = require("../models/Application");
const JobDescription = require("../models/JobDescription");
const Resume = require("../models/Resume");
const { matchResumeToJob } = require("../services/mlService");
const jwt = require("jsonwebtoken");
const { sendInterviewEmail } = require("../services/emailService");

const createApplication = async (req, res, next) => {
  try {
    const { jobId, resumeId } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (req.user.role !== "CANDIDATE") {
      return res.status(403).json({
        success: false,
        message: "Only candidates can apply for a job",
      });
    }

    if (!jobId || !mongoose.isValidObjectId(jobId)) {
      return res.status(400).json({
        success: false,
        message: "A valid Job ID is required",
      });
    }

    if (!resumeId || !mongoose.isValidObjectId(resumeId)) {
      return res.status(400).json({
        success: false,
        message: "A valid Resume ID is required",
      });
    }

    const job = await JobDescription.findOne({
      _id: jobId,
      status: "PUBLISHED",
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Published job not found",
      });
    }

    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found or does not belong to the candidate",
      });
    }

    const existingApplication = await Application.findOne({
      candidateId: req.user._id,
      jobId,
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    const application = await Application.create({
      candidateId: req.user._id,
      jobId,
      resumeId,
      status: "PENDING_MATCHING",
      matching: {
        score: null,
        skillsScore: null,
        similarityScore: null,
        keywordScore: null,
        experienceScore: null,
        educationScore: null,
        matchedSkills: [],
        missingSkills: [],
        matchedKeywords: [],
        missingKeywords: [],
        analyzedAt: null,
      },
    });

    const populatedApplication = await Application.findById(application._id)
      .populate("candidateId", "name email role")
      .populate("jobId", "title description status")
      .populate("resumeId", "fileName skills detectedDomain");

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: populatedApplication,
    });
  } catch (error) {
    console.error("Application creation error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    next(error);
  }
};

const getMyApplications = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (req.user.role !== "CANDIDATE") {
      return res.status(403).json({
        success: false,
        message: "Only candidates can access their applications",
      });
    }

    const applications = await Application.find({
      candidateId: req.user._id,
    })
      .populate("jobId", "title description status publishedAt")
      .populate("resumeId", "fileName skills detectedDomain")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error("Error retrieving candidate applications:", error.message);
    next(error);
  }
};

const getApplicationById = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application = await Application.findById(req.params.id)
      .populate("candidateId", "name email role")
      .populate("jobId", "title description status publishedAt userId")
      .populate("resumeId", "fileName skills detectedDomain rawText");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const isCandidate =
      req.user.role === "CANDIDATE" &&
      application.candidateId?._id.toString() === req.user._id.toString();

    const isRecruiter =
      req.user.role === "RECRUITER" &&
      application.jobId?.userId?.toString() === req.user._id.toString();

    if (!isCandidate && !isRecruiter) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error("Error retrieving application:", error.message);
    next(error);
  }
};

const getApplicationsByJob = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (req.user.role !== "RECRUITER") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can access job applications",
      });
    }

    if (!mongoose.isValidObjectId(req.params.jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await JobDescription.findOne({
      _id: req.params.jobId,
      userId: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or does not belong to this recruiter",
      });
    }

    const applications = await Application.find({
      jobId: job._id,
    })
      .populate("candidateId", "name email role")
      .populate("resumeId", "fileName skills detectedDomain")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error("Error retrieving job applications:", error.message);
    next(error);
  }
};

const runMatchingForJob = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (req.user.role !== "RECRUITER") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can run matching",
      });
    }

    const { jobId } = req.params;

    if (!mongoose.isValidObjectId(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await JobDescription.findOne({
      _id: jobId,
      userId: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or does not belong to this recruiter",
      });
    }

    const applications = await Application.find({
      jobId: job._id,
    }).populate("resumeId");

    if (applications.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No applications found for this job",
        count: 0,
        data: [],
      });
    }

    const requiredSkills =
      job.extractedSkills?.requiredSkills || [];

    const preferredSkills =
      job.extractedSkills?.preferredSkills || [];

    const keywords = job.keywords || [];

    const results = [];
    const errors = [];

    for (const application of applications) {
      try {
        const resume = application.resumeId;

        if (!resume) {
          errors.push({
            applicationId: application._id,
            message: "Resume not found",
          });
          continue;
        }

        const resumeText = resume.rawText || "";

        if (!resumeText.trim()) {
          errors.push({
            applicationId: application._id,
            message: "Resume has no extracted text",
          });
          continue;
        }

        const resumeSkills = [
          ...(resume.skills?.technicalSkills || []),
          ...(resume.skills?.softSkills || []),
        ];

        const mlResponse = await matchResumeToJob({
          resumeText,
          resumeSkills,
          jobDescription: job.description || "",
          requiredSkills,
          preferredSkills,
          keywords,
        });

        const matchingResult = mlResponse?.data ?? mlResponse;

        if (!matchingResult || matchingResult.success === false) {
          throw new Error(
            matchingResult?.message || "Matching service returned an invalid result"
          );
        }

        const matchingData =
          matchingResult.data ?? matchingResult;

        const score = matchingData.score ?? matchingData.finalScore ?? null;

        if (typeof score !== "number" || !Number.isFinite(score)) {
          throw new Error("Matching result does not contain a valid score");
        }

        application.matching = {
          score,
          skillsScore: matchingData.skillsScore ?? null,
          similarityScore: matchingData.similarityScore ?? null,
          keywordScore: matchingData.keywordScore ?? null,
          experienceScore: matchingData.experienceScore ?? null,
          educationScore: matchingData.educationScore ?? null,
          matchedSkills: matchingData.matchedSkills || [],
          missingSkills: matchingData.missingSkills || [],
          matchedKeywords: matchingData.matchedKeywords || [],
          missingKeywords: matchingData.missingKeywords || [],
          analyzedAt: new Date(),
        };

        application.status = "MATCHED";

        await application.save();

        results.push({
          applicationId: application._id,
          score: application.matching.score,
          status: application.status,
        });
      } catch (error) {
        console.error(
          `Matching error for application ${application._id}:`,
          error.message
        );

        errors.push({
          applicationId: application._id,
          message: error.message,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Matching process completed",
      total: applications.length,
      processed: results.length,
      failed: errors.length,
      data: results,
      errors,
    });
  } catch (error) {
    console.error("Error running matching:", error.message);
    next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    if (req.user?.role !== "RECRUITER") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can update applications.",
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID.",
      });
    }

    if (!["SHORTLISTED", "NOT_SELECTED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status.",
      });
    }

    const application = await Application.findById(id)
      .populate("jobId", "title userId");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    if (
      !application.jobId ||
      application.jobId.userId.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not own this job offer.",
      });
    }

    const score =
      application.matching?.overallScore ??
      application.matching?.score;

    if (status === "SHORTLISTED") {
      if (typeof score !== "number") {
        return res.status(400).json({
          success: false,
          message: "Run matching before shortlisting.",
        });
      }
    }

    application.status = status;
    await application.save();

    return res.status(200).json({
      success: true,
      message:
        status === "SHORTLISTED"
          ? "Candidate shortlisted successfully."
          : "Candidate marked as not selected.",
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

const sendInterviewInvitation = async (req, res, next) => {
  try {
    if (req.user?.role !== "RECRUITER") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can send invitations.",
      });
    }

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID.",
      });
    }

    const application = await Application.findById(id)
      .populate("candidateId", "name email")
      .populate("jobId", "title userId");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    if (
      !application.jobId ||
      application.jobId.userId.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not own this job offer.",
      });
    }

    if (application.status !== "SHORTLISTED") {
      return res.status(400).json({
        success: false,
        message: "Only shortlisted candidates can be invited.",
      });
    }

    if (!application.candidateId?.email) {
      return res.status(400).json({
        success: false,
        message: "Candidate email not found.",
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is not configured.",
      });
    }

    const token = jwt.sign(
      {
        applicationId: application._id.toString(),
        type: "INTERVIEW",
      },
      secret,
      { expiresIn: "48h" }
    );

    const clientUrl =
      process.env.CLIENT_URL || "http://localhost:5173";

    const interviewUrl =
      `${clientUrl}/interview/${token}`;

    // Envoi de l'email avant de modifier le statut
    await sendInterviewEmail(
      application.candidateId.email,
      interviewUrl
    );

    application.status = "INTERVIEW_INVITED";
    await application.save();

    return res.status(200).json({
      success: true,
      message: "Interview invitation sent successfully.",
      data: {
        applicationId: application._id,
        candidateEmail: application.candidateId.email,
        interviewUrl,
        expiresIn: "48h",
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createApplication,
  getMyApplications,
  getApplicationById,
  getApplicationsByJob,
  runMatchingForJob,
  updateApplicationStatus,
  sendInterviewInvitation,
};