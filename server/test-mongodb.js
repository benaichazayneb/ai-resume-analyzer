require("dotenv").config();
const mongoose = require("mongoose");

const User = require("./models/User");
const Resume = require("./models/Resume");
const JobDescription = require("./models/JobDescription");
const Analysis = require("./models/Analysis");

async function testMongoDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected");

    // USER
    const user = await User.create({
      name: "Test User",
      email: `test-${Date.now()}@example.com`,
      password: "password123"
    });

    console.log("✅ User inserted:", user._id);

    // RESUME
    const resume = await Resume.create({
      userId: user._id,
      fileName: "test-resume.pdf",
      filePath: "uploads/test-resume.pdf",
      rawText: "Software Developer with Node.js React and MongoDB experience.",

      parsedData: {
        personalInfo: {
          name: "Test User",
          email: user.email
        },
        education: [
          {
            degree: "Computer Science",
            institution: "Test University",
            year: 2026
          }
        ],
        experience: [
          {
            jobTitle: "Software Developer",
            company: "Test Company",
            duration: "1 year",
            description: "Developed web applications."
          }
        ]
      },

      skills: {
        technicalSkills: [
          "JavaScript",
          "Node.js",
          "React",
          "MongoDB"
        ],
        softSkills: [
          "Communication",
          "Teamwork"
        ]
      },

      detectedDomain: {
        category: "Software Engineering",
        confidence: 0.95
      }
    });

    console.log("✅ Resume inserted:", resume._id);

    // JOB DESCRIPTION
    const job = await JobDescription.create({
      userId: user._id,
      title: "Full Stack Developer",

      description:
        "Looking for a Full Stack Developer with Node.js, React and MongoDB experience.",

      extractedSkills: {
        requiredSkills: [
          "JavaScript",
          "Node.js",
          "React"
        ],
        preferredSkills: [
          "MongoDB",
          "Docker"
        ]
      },

      experienceRequirements: "1+ year",
      educationRequirements: "Computer Science degree",

      keywords: [
        "Node.js",
        "React",
        "MongoDB",
        "Docker"
      ]
    });

    console.log("✅ JobDescription inserted:", job._id);

    // ANALYSIS
    const analysis = await Analysis.create({
      userId: user._id,
      resumeId: resume._id,
      jobDescriptionId: job._id,

      matchScore: 85,
      skillsScore: 90,
      similarityScore: 82,
      keywordScore: 80,
      experienceScore: 85,
      educationScore: 90,

      matchedSkills: [
        "JavaScript",
        "Node.js",
        "React",
        "MongoDB"
      ],

      missingSkills: [
        "Docker"
      ],

      matchedKeywords: [
        "Node.js",
        "React",
        "MongoDB"
      ],

      missingKeywords: [
        "Docker"
      ],

      professionalSummary:
        "Candidate has a strong foundation in full-stack development.",

      recommendations: [
        "Learn Docker",
        "Improve cloud deployment skills"
      ],

      interviewQuestions: {
        technical: [
          "Explain how Node.js works.",
          "What is MongoDB?"
        ],

        behavioral: [
          "Tell us about a difficult project."
        ]
      }
    });

    console.log("✅ Analysis inserted:", analysis._id);

    console.log("\n🎉 ALL MONGODB TESTS PASSED!");
  } catch (error) {
    console.error("\n❌ MongoDB test failed:");
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed");
  }
}

testMongoDB();