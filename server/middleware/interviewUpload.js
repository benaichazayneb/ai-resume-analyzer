const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ============================================================
// DOSSIER DE DESTINATION
// ============================================================

const uploadDirectory = path.join(
  __dirname,
  "..",
  "uploads",
  "interviews"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

// ============================================================
// STOCKAGE
// ============================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension =
      path.extname(file.originalname) || ".webm";

    const filename =
      `interview-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${extension}`;

    cb(null, filename);
  },
});

// ============================================================
// FILTRE
// ============================================================

const fileFilter = (req, file, cb) => {
  const mimeType = file.mimetype.toLowerCase();

  console.log(
    "🎥 MIME TYPE VIDÉO REÇU :",
    mimeType
  );

  const isAllowed =
    mimeType.startsWith("video/webm") ||
    mimeType.startsWith("video/mp4") ||
    mimeType.startsWith("video/ogg") ||
    mimeType.startsWith("video/quicktime");

  if (isAllowed) {
    console.log("✅ Format vidéo accepté");

    cb(null, true);
  } else {
    console.error(
      "❌ Format vidéo refusé :",
      mimeType
    );

    cb(
      new Error(
        `Format vidéo non supporté : ${mimeType}`
      ),
      false
    );
  }
};

// ============================================================
// MULTER
// ============================================================

const uploadInterviewVideo = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 500 * 1024 * 1024,
  },
});

module.exports = uploadInterviewVideo;