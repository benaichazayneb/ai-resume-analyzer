require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

if (!process.env.GEMINI_API_KEY) {
  throw new Error(
    "La variable GEMINI_API_KEY est absente du fichier .env"
  );
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

// =====================================================
// Fonction générale pour appeler Gemini avec retry
// =====================================================

async function generateWithRetry(prompt, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
    } catch (error) {
      const status = Number(error.status || error.code);

      // Réessayer uniquement en cas d'indisponibilité temporaire
      if (status !== 503 || attempt === maxAttempts) {
        throw error;
      }

      const delay = attempt * 2000;

      console.warn(
        `Gemini indisponible (503). Nouvelle tentative dans ${
          delay / 1000
        }s...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("Gemini n'a pas pu répondre.");
}

// =====================================================
// 1. Générer les questions de l'entretien
// =====================================================

async function generateInterviewQuestions({
  jobTitle,
  jobDescription,
  candidateSkills = [],
  resumeText = "",
}) {
  const prompt = `
Tu es un recruteur technique.

Génère exactement 5 questions d'entretien adaptées au candidat
et à l'offre d'emploi.

Titre du poste :
${jobTitle || "Non précisé"}

Description :
${jobDescription || "Non précisée"}

Compétences du candidat :
${candidateSkills.join(", ") || "Non précisées"}

Extrait du CV :
${resumeText.slice(0, 5000) || "Non disponible"}

Retourne uniquement un tableau JSON valide de 5 objets
avec cette structure :

[
  {
    "question": "Question...",
    "type": "TECHNICAL",
    "skill": "JavaScript",
    "answer": ""
  }
]

Règles :
- Génère exactement 5 questions.
- Utilise uniquement TECHNICAL, BEHAVIORAL ou EXPERIENCE
  pour le champ type.
- Adapte les questions à l'offre et au CV.
- Ne fournis pas les réponses attendues.
- Le champ answer doit être une chaîne vide.
`;

  try {
    const response = await generateWithRetry(prompt);

    const text = response.text;

    if (!text) {
      throw new Error("Gemini n'a retourné aucun contenu.");
    }

    let questions;

    try {
      questions = JSON.parse(text);
    } catch (error) {
      console.error(
        "Réponse JSON invalide de Gemini :",
        text
      );

      throw new Error(
        "Gemini a retourné un JSON invalide."
      );
    }

    if (!Array.isArray(questions) || questions.length !== 5) {
      throw new Error(
        "Gemini doit retourner exactement 5 questions."
      );
    }

    const allowedTypes = [
      "TECHNICAL",
      "BEHAVIORAL",
      "EXPERIENCE",
    ];

    for (const question of questions) {
      if (
        typeof question.question !== "string" ||
        !question.question.trim()
      ) {
        throw new Error(
          "Une question générée est invalide."
        );
      }

      if (!allowedTypes.includes(question.type)) {
        question.type = "TECHNICAL";
      }

      if (typeof question.skill !== "string") {
        question.skill = "";
      }

      // Le candidat doit fournir lui-même la réponse
      question.answer = "";
    }

    return questions;
  } catch (error) {
    console.error(
      "Erreur generateInterviewQuestions:",
      error.message
    );

    throw error;
  }
}

// =====================================================
// 2. Analyser les réponses de l'entretien
// =====================================================

async function analyzeInterview({
  jobTitle,
  jobDescription,
  candidateSkills = [],
  resumeText = "",
  questions = [],
}) {
  // Construire le contenu questions + réponses
  const interviewContent = questions
    .map((item, index) => {
      return `
Question ${index + 1} :
${item.question}

Type :
${item.type}

Compétence évaluée :
${item.skill || "Non précisée"}

Réponse du candidat :
${item.answer || "Aucune réponse"}
`;
    })
    .join("\n-------------------------\n");

  const prompt = `
Tu es un recruteur technique spécialisé dans l'évaluation
des candidats après un entretien.

Analyse les réponses du candidat en fonction :
- de l'offre d'emploi
- des compétences demandées
- des compétences présentes dans le CV
- de la qualité des réponses données pendant l'entretien.

IMPORTANT :
- Évalue uniquement les réponses fournies.
- Ne fais aucune supposition sur des informations absentes.
- Ne donne pas de diagnostic personnel ou psychologique.
- Les scores doivent être compris entre 0 et 100.
- Sois objectif et professionnel.

=========================
OFFRE D'EMPLOI
=========================

Titre :
${jobTitle || "Non précisé"}

Description :
${jobDescription || "Non précisée"}

=========================
COMPÉTENCES DU CANDIDAT
=========================

${candidateSkills.join(", ") || "Non précisées"}

=========================
EXTRAIT DU CV
=========================

${resumeText.slice(0, 5000) || "Non disponible"}

=========================
ENTRETIEN
=========================

${interviewContent}

=========================
FORMAT DE RÉPONSE
=========================

Retourne UNIQUEMENT un objet JSON valide avec exactement
cette structure :

{
  "overallScore": 0,
  "technicalScore": 0,
  "communicationScore": 0,
  "relevanceScore": 0,
  "strengths": [
    "Point fort 1",
    "Point fort 2",
    "Point fort 3"
  ],
  "weaknesses": [
    "Point à améliorer 1",
    "Point à améliorer 2"
  ],
  "recommendations": [
    "Recommandation 1",
    "Recommandation 2",
    "Recommandation 3"
  ],
  "summary": "Résumé global de l'entretien."
}

Règles supplémentaires :
- overallScore : évaluation globale des réponses.
- technicalScore : qualité des connaissances techniques démontrées.
- communicationScore : clarté et structure des réponses.
- relevanceScore : adéquation des réponses avec le poste.
- strengths : maximum 5 points forts.
- weaknesses : maximum 5 points faibles.
- recommendations : maximum 5 recommandations.
- summary : résumé professionnel et factuel.
- Ne retourne aucun texte en dehors du JSON.
`;

  try {
    const response = await generateWithRetry(prompt);

    const text = response.text;

    if (!text) {
      throw new Error(
        "Gemini n'a retourné aucun résultat d'analyse."
      );
    }

    let analysis;

    try {
      analysis = JSON.parse(text);
    } catch (error) {
      console.error(
        "JSON d'analyse invalide retourné par Gemini :",
        text
      );

      throw new Error(
        "Gemini a retourné un JSON d'analyse invalide."
      );
    }

    // Vérification des scores
    const scoreFields = [
      "overallScore",
      "technicalScore",
      "communicationScore",
      "relevanceScore",
    ];

    for (const field of scoreFields) {
      if (
        typeof analysis[field] !== "number" ||
        analysis[field] < 0 ||
        analysis[field] > 100
      ) {
        throw new Error(
          `Score invalide pour ${field}.`
        );
      }
    }

    // Vérification des tableaux
    if (!Array.isArray(analysis.strengths)) {
      analysis.strengths = [];
    }

    if (!Array.isArray(analysis.weaknesses)) {
      analysis.weaknesses = [];
    }

    if (!Array.isArray(analysis.recommendations)) {
      analysis.recommendations = [];
    }

    if (typeof analysis.summary !== "string") {
      analysis.summary = "";
    }

    return analysis;
  } catch (error) {
    console.error(
      "Erreur analyzeInterview:",
      error.message
    );

    throw error;
  }
}

// =====================================================
// Export
// =====================================================

module.exports = {
  generateInterviewQuestions,
  analyzeInterview,
};