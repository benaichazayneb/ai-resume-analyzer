const express = require("express");

const cors = require("cors");

const helmet = require("helmet");

const healthRoutes = require("./routes/healthRoutes");

const authRoutes = require("./routes/authRoutes");

const analysisRoutes = require("./routes/analysisRoutes");

const resumeRoutes = require("./routes/resumeRoutes");

const jobRoutes = require("./routes/jobDescriptionRoutes");

const applicationRoutes = require("./routes/applicationRoutes");

const interviewRoutes = require("./routes/interviewRoutes");
const {
  notFound,
  errorHandler,
} = require("./middleware/errorMiddleware");

const app = express();

app.use(helmet());

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to AI Resume Analyzer API",
  });
});
const path = require("path");

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

app.use("/api/health", healthRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/resumes", resumeRoutes);

app.use("/api/jobs", jobRoutes);

app.use("/api/applications", applicationRoutes);

app.use("/api/analysis", analysisRoutes);

app.use("/api/interviews", interviewRoutes);

app.use(notFound);

app.use(errorHandler);

module.exports = app;