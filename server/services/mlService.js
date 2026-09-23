const axios = require("axios");

const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL || "http://localhost:8000";

const analyzeText = async (text) => {
  try {
    const response = await axios.post(
      `${ML_SERVICE_URL}/api/analyze-text`,
      {
        text,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "❌ ML text analysis error:",
      error.response?.data || error.message
    );

    throw new Error("ML text analysis service unavailable");
  }
};

const matchResumeToJob = async ({
  resumeText,
  resumeSkills,
  jobDescription,
  requiredSkills,
  preferredSkills,
  keywords,
}) => {
  try {
    const response = await axios.post(
      `${ML_SERVICE_URL}/api/matching`,
      {
        resumeText,
        resumeSkills,
        jobDescription,
        requiredSkills,
        preferredSkills,
        keywords,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "❌ ML matching error:",
      error.response?.data || error.message
    );

    throw new Error("ML matching service unavailable");
  }
};

module.exports = {
  analyzeText,
  matchResumeToJob,
};