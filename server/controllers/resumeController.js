const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");
const { analyzeText } = require("../services/mlService");
const Resume = require("../models/Resume");

const uploadResume = async (req, res, next) => {
  let parser;

  try {
    // 1. Vérifier qu'un fichier a été envoyé
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF file",
      });
    }

    // 2. Vérifier que l'utilisateur est authentifié
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    console.log(`📄 Processing CV: ${req.file.originalname}`);

    // 3. Lire le fichier PDF
    const pdfBuffer = fs.readFileSync(req.file.path);

    // 4. Créer le parser PDF
    parser = new PDFParse({
      data: pdfBuffer,
    });

    // 5. Extraire le texte
    const result = await parser.getText();

    const rawText = result.text?.trim() || "";

    // 6. Vérifier que du texte a bien été extrait
    if (!rawText) {
      return res.status(400).json({
        success: false,
        message:
          "No text could be extracted from this PDF. The CV may be scanned or image-based.",
      });
    }

    console.log(`Text extracted: ${rawText.length} characters`);
    console.log("Sending text to ML Service...");

const mlResult = await analyzeText(rawText);

console.log("NLP analysis completed");
    // 7. Créer le document Resume
        const resume = await Resume.create({
      userId: req.user._id,

      fileName: req.file.originalname,

      filePath: req.file.path,

      rawText: rawText,

      parsedData: {
        personalInfo: {},
        education: [],
        experience: [],
      },

      skills: {
        technicalSkills:
          mlResult.data?.technicalSkills || [],

        softSkills:
          mlResult.data?.softSkills || [],
      },

      detectedDomain: {
        category: null,
        confidence: null,
      },
    });
    // 8. Réponse
    res.status(201).json({
      success: true,
      message: "Resume uploaded and text extracted successfully",
      data: {
        id: resume._id,
        fileName: resume.fileName,
        filePath: resume.filePath,
        textLength: rawText.length,
        rawText: rawText,

        skills: {
          technicalSkills: resume.skills.technicalSkills,
          softSkills: resume.skills.softSkills,
        },

        createdAt: resume.createdAt,
      },
    });
  } catch (error) {
    console.error("Resume upload error:", error.message);

    // Supprimer le fichier si quelque chose échoue
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log(" Uploaded file deleted after error");
      } catch (deleteError) {
        console.error(
          " Could not delete uploaded file:",
          deleteError.message
        );
      }
    }

    next(error);
  } finally {
    // Libérer les ressources du parser PDF
    if (parser) {
      try {
        await parser.destroy();
      } catch (destroyError) {
        console.error(
          "⚠️ PDF parser cleanup error:",
          destroyError.message
        );
      }
    }
  }
};

module.exports = {
  uploadResume,
};