const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const ffmpegPath = require("ffmpeg-static");

const {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} = require("@google/genai");

// ============================================================
// GEMINI
// ============================================================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL =
  process.env.GEMINI_MODEL ||
  "gemini-3.6-flash";

const TRANSCRIPTION_MODEL =
  process.env.GEMINI_TRANSCRIPTION_MODEL ||
  "gemini-3.5-transcribe";

// ============================================================
// RETRY GEMINI
// ============================================================

async function generateWithRetry(
  prompt,
  maxAttempts = 3
) {
  let lastError = null;

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt++
  ) {
    try {
      const response =
        await ai.models.generateContent({
          model: MODEL,

          contents: prompt,

          config: {
            responseMimeType:
              "application/json",
          },
        });

      if (!response.text) {
        throw new Error(
          "Gemini n'a retourné aucun résultat."
        );
      }

      return response.text;
    } catch (error) {
      lastError = error;

      console.error(
        `Gemini attempt ${attempt}/${maxAttempts}:`,
        error.message
      );

      const status =
        error.status ||
        error.code;

      if (
        status === 503 ||
        status === 429
      ) {
        const delay =
          attempt * 2000;

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              delay
            )
        );

        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

// ============================================================
// PARSER JSON
// ============================================================

function parseGeminiJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch {
      throw new Error(
        "Réponse Gemini JSON invalide."
      );
    }
  }
}

// ============================================================
// GÉNÉRER LES QUESTIONS CLASSIQUES
// ============================================================

async function generateInterviewQuestions({
  jobTitle,
  jobDescription,
  candidateSkills = [],
  resumeText = "",
}) {
  const prompt = `
Tu es un recruteur technique expérimenté.

Tu dois préparer un entretien de recrutement.

POSTE :
${jobTitle}

DESCRIPTION :
${jobDescription}

COMPÉTENCES DU CANDIDAT :
${candidateSkills.join(", ")}

CV :
${resumeText}

Génère exactement 5 questions.

Les questions doivent couvrir :
- expérience
- comportement
- technique
- compétences liées au poste

Retourne uniquement un JSON valide sous cette forme :

[
  {
    "question": "...",
    "type": "TECHNICAL",
    "skill": "...",
    "answer": ""
  }
]

Les types autorisés sont :
TECHNICAL
BEHAVIORAL
EXPERIENCE
`;

  const text =
    await generateWithRetry(prompt);

  return parseGeminiJSON(text);
}

// ============================================================
// QUESTION DYNAMIQUE
// ============================================================

async function generateNextInterviewQuestion({
  jobTitle,
  jobDescription,
  candidateSkills = [],
  resumeText = "",
  conversation = [],
  questionNumber = 1,
  maxQuestions = 8,
}) {
  const conversationText =
    conversation.length > 0
      ? conversation
          .map(
            (item, index) => `
Question ${index + 1} :
${item.question}

Réponse du candidat :
${item.answer || "(aucune réponse)"}
`
          )
          .join("\n")
      : "Aucune conversation précédente.";

  const prompt = `
Tu es un recruteur humain expérimenté qui réalise
un entretien vidéo avec un candidat.

Tu dois poser UNE SEULE nouvelle question.

POSTE :
${jobTitle}

DESCRIPTION DU POSTE :
${jobDescription}

COMPÉTENCES DU CANDIDAT :
${candidateSkills.join(", ")}

CV :
${resumeText}

NUMÉRO DE QUESTION :
${questionNumber}

NOMBRE MAXIMUM :
${maxQuestions}

CONVERSATION PRÉCÉDENTE :
${conversationText}

Règles :

1. Ne répète jamais une question précédente.

2. Utilise les réponses précédentes pour adapter
   la prochaine question.

3. Si le candidat mentionne une expérience,
   tu peux demander une précision.

4. Si une compétence technique importante
   n'a pas encore été vérifiée, tu peux
   l'explorer.

5. Les questions doivent être naturelles
   pour un entretien oral.

6. Ne demande pas plusieurs choses complexes
   dans la même question.

7. La question doit être directement liée
   au poste ou au parcours du candidat.

Retourne uniquement :

{
  "question": "...",
  "type": "TECHNICAL",
  "skill": "..."
}

Types autorisés :
TECHNICAL
BEHAVIORAL
EXPERIENCE
`;

  const text =
    await generateWithRetry(prompt);

  const question =
    parseGeminiJSON(text);

  return {
    question:
      question.question.trim(),

    type:
      question.type || "BEHAVIORAL",

    skill:
      question.skill
        ? question.skill.trim()
        : "",

    answer: "",
  };
}

// ============================================================
// EXTRAIRE L'AUDIO DE LA VIDÉO
// ============================================================

function extractAudioFromVideo(videoPath) {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) {
      return reject(
        new Error("FFmpeg introuvable.")
      );
    }

    const audioPath =
      path.join(
        path.dirname(videoPath),
        `${path.basename(
          videoPath,
          path.extname(videoPath)
        )}-audio.mp3`
      );

    console.log(
      "Extraction de l'audio de la vidéo..."
    );

    const ffmpeg = spawn(
      ffmpegPath,
      [
        "-i",
        videoPath,

        "-vn",

        "-acodec",
        "libmp3lame",

        "-ar",
        "16000",

        "-ac",
        "1",

        "-y",

        audioPath,
      ],
      {
        windowsHide: true,
      }
    );

    let stderr = "";

    ffmpeg.stderr.on(
      "data",
      (data) => {
        stderr += data.toString();
      }
    );

    ffmpeg.on(
      "error",
      (error) => {
        reject(
          new Error(
            `Impossible de lancer FFmpeg : ${error.message}`
          )
        );
      }
    );

    ffmpeg.on(
      "close",
      (code) => {
        if (code !== 0) {
          return reject(
            new Error(
              `Extraction audio échouée : ${stderr}`
            )
          );
        }

        if (!fs.existsSync(audioPath)) {
          return reject(
            new Error(
              "Le fichier audio n'a pas été créé."
            )
          );
        }

        console.log(
          "Audio extrait :",
          audioPath
        );

        resolve(audioPath);
      }
    );
  });
}

// ============================================================
// TRANSCRIPTION VIDÉO
// ============================================================

async function transcribeInterviewVideo(
  videoPath
) {
  if (!videoPath) {
    throw new Error(
      "Chemin vidéo manquant."
    );
  }

  if (!fs.existsSync(videoPath)) {
    throw new Error(
      `Vidéo introuvable : ${videoPath}`
    );
  }

  console.log(
    "Préparation de la vidéo pour transcription..."
  );

  // ----------------------------------------------------------
  // EXTRAIRE AUDIO
  // ----------------------------------------------------------

  const audioPath =
    await extractAudioFromVideo(
      videoPath
    );

  try {
    // --------------------------------------------------------
    // UPLOAD AUDIO VERS GEMINI
    // --------------------------------------------------------

    console.log(
      "Upload de l'audio vers Gemini..."
    );

    const uploadedFile =
      await ai.files.upload({
        file: audioPath,

        config: {
          mimeType: "audio/mpeg",
        },
      });

    console.log(
      "Fichier audio Gemini :",
      uploadedFile.name
    );

    // --------------------------------------------------------
    // ATTENDRE QUE LE FICHIER SOIT PRÊT
    // --------------------------------------------------------

    let file = uploadedFile;

    while (
      file.state &&
      file.state.toString() ===
        "PROCESSING"
    ) {
      console.log(
        "Gemini traite l'audio..."
      );

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            3000
          )
      );

      file =
        await ai.files.get({
          name: file.name,
        });
    }

    // --------------------------------------------------------
    // VÉRIFIER L'ÉTAT
    // --------------------------------------------------------

    if (
      file.state &&
      file.state.toString() ===
        "FAILED"
    ) {
      throw new Error(
        "Gemini n'a pas réussi à traiter l'audio."
      );
    }

    console.log(
      "Audio prêt pour transcription."
    );

    // --------------------------------------------------------
    // TRANSCRIPTION GEMINI
    // --------------------------------------------------------

    console.log(
      "Transcription de l'entretien..."
    );

    const interaction =
      await ai.interactions.create({
        model:
          TRANSCRIPTION_MODEL,

        input: [
          {
            type: "text",

            text: `
Transcris intégralement l'audio de cet entretien
de recrutement.

Instructions :

- Transcris toutes les paroles audibles.
- Ne résume pas.
- Ne supprime pas les hésitations importantes.
- Conserve l'ordre de la conversation.
- Identifie les intervenants lorsque cela est possible.
- Le recruteur IA parle en premier.
- Le candidat répond ensuite.
- Utilise le français comme langue principale.
- Si certaines phrases sont en anglais,
  conserve-les dans leur langue originale.

Retourne uniquement la transcription.
`,
          },

          {
            type: "audio",

            uri: file.uri,

            mime_type:
              file.mimeType ||
              "audio/mpeg",
          },
        ],
      });

    // --------------------------------------------------------
    // RÉCUPÉRER LE TEXTE
    // --------------------------------------------------------

    let transcript = "";

    if (
      interaction.output_text
    ) {
      transcript =
        interaction.output_text.trim();
    }

    if (
      !transcript &&
      interaction.outputs
    ) {
      transcript =
        interaction.outputs
          .map(
            (output) => {
              if (
                output.type ===
                "text"
              ) {
                return (
                  output.text || ""
                );
              }

              return "";
            }
          )
          .join("\n")
          .trim();
    }

    if (!transcript) {
      throw new Error(
        "La transcription Gemini est vide."
      );
    }

    console.log(
      "✅ Transcription terminée."
    );

    return {
      text: transcript,

      language: "fr",

      geminiFileName:
        file.name,

      geminiFileUri:
        file.uri,
    };
  } finally {
    // --------------------------------------------------------
    // SUPPRIMER LE MP3 TEMPORAIRE
    // --------------------------------------------------------

    try {
      if (
        fs.existsSync(audioPath)
      ) {
        fs.unlinkSync(
          audioPath
        );

        console.log(
          "Fichier audio temporaire supprimé."
        );
      }
    } catch (error) {
      console.warn(
        "Impossible de supprimer le fichier audio temporaire :",
        error.message
      );
    }
  }
}

// ============================================================
// ANALYSE CLASSIQUE
// ============================================================

async function analyzeInterview({
  jobTitle,
  jobDescription,
  candidateSkills = [],
  resumeText = "",
  questions = [],
}) {
  const qaText = questions
    .map(
      (q, index) => `
Question ${index + 1} :
${q.question}

Type :
${q.type}

Compétence :
${q.skill}

Réponse :
${q.answer || "(aucune réponse)"}
`
    )
    .join("\n");

  const prompt = `
Tu es un recruteur expérimenté.

Analyse cet entretien.

POSTE :
${jobTitle}

DESCRIPTION :
${jobDescription}

COMPÉTENCES DU CANDIDAT :
${candidateSkills.join(", ")}

CV :
${resumeText}

ENTRETIEN :
${qaText}

Évalue :

- qualité technique
- pertinence des réponses
- communication
- adéquation avec le poste

Ne déduis pas d'informations personnelles
non présentes dans les réponses.

Retourne uniquement un JSON :

{
  "overallScore": 0,
  "technicalScore": 0,
  "communicationScore": 0,
  "relevanceScore": 0,
  "strengths": [],
  "weaknesses": [],
  "recommendations": [],
  "summary": ""
}

Les scores doivent être compris entre 0 et 100.
`;

  const text =
    await generateWithRetry(prompt);

  return parseGeminiJSON(text);
}

// ============================================================
// ANALYSE DE LA CONVERSATION COMPLÈTE
// ============================================================

async function analyzeInterviewConversation({
  jobTitle,
  jobDescription,
  candidateSkills = [],
  resumeText = "",
  transcript = "",
}) {
  const prompt = `
Tu es un recruteur expérimenté spécialisé
dans l'évaluation de candidats techniques.

Analyse la transcription complète d'un entretien
de recrutement.

POSTE :
${jobTitle}

DESCRIPTION :
${jobDescription}

COMPÉTENCES DU CANDIDAT :
${candidateSkills.join(", ")}

CV DU CANDIDAT :
${resumeText}

TRANSCRIPTION COMPLÈTE :
${transcript}

====================================================
OBJECTIF
====================================================

Évalue uniquement ce qui est réellement observable
dans les informations fournies.

Analyse :

1. Les compétences techniques démontrées.

2. La pertinence des réponses par rapport
   au poste.

3. La capacité du candidat à expliquer
   ses expériences.

4. La qualité de la communication verbale
   observable dans la transcription.

5. La cohérence des réponses.

6. Les points forts.

7. Les points faibles ou éléments à approfondir.

8. Des recommandations pour le recruteur.

====================================================
COMMUNICATION
====================================================

Analyse des éléments observables dans le discours :

- clarté
- structure
- précision
- concision
- capacité à expliquer
- vocabulaire professionnel
- réponses directement liées aux questions

Ne déduis pas la personnalité profonde
ou l'état psychologique du candidat.

====================================================
SENTIMENT / TON
====================================================

Décris uniquement les éléments linguistiques
observables dans le discours :

- ton global
- enthousiasme exprimé verbalement
- hésitations
- formulation positive ou négative
- niveau apparent de confiance dans les propos

IMPORTANT :

Ne prétends pas détecter avec certitude :

- stress
- anxiété
- mensonge
- personnalité
- émotions internes
- état mental

Ces éléments ne peuvent pas être déterminés
de manière fiable uniquement à partir
d'une transcription.

====================================================
FORMAT
====================================================

Retourne UNIQUEMENT ce JSON :

{
  "overallScore": 0,
  "technicalScore": 0,
  "communicationScore": 0,
  "relevanceScore": 0,

  "strengths": [],

  "weaknesses": [],

  "recommendations": [],

  "communicationObservations": [],

  "sentimentObservations": [],

  "summary": ""
}

Les scores sont compris entre 0 et 100.

Le résumé doit être professionnel,
factuel et basé uniquement sur
l'entretien fourni.
`;

  const text =
    await generateWithRetry(prompt);

  return parseGeminiJSON(text);
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  generateInterviewQuestions,
  generateNextInterviewQuestion,
  transcribeInterviewVideo,
  analyzeInterview,
  analyzeInterviewConversation,
};