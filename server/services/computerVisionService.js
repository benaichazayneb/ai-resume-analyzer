const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

// ============================================================
// ANALYSE COMPUTER VISION
// ============================================================

async function analyzeInterviewVideo(videoPath) {
  return new Promise((resolve, reject) => {
    // ----------------------------------------------------------
    // Vérifier le chemin vidéo
    // ----------------------------------------------------------

    if (!videoPath) {
      return reject(
        new Error("Chemin vidéo manquant.")
      );
    }

    if (!fs.existsSync(videoPath)) {
      return reject(
        new Error(
          `Vidéo introuvable pour Computer Vision : ${videoPath}`
        )
      );
    }

    console.log("");
    console.log("========================================");
    console.log("👁️ COMPUTER VISION");
    console.log("========================================");

    console.log(
      "Démarrage Computer Vision..."
    );

    // ----------------------------------------------------------
    // Chemin du script Python
    // ----------------------------------------------------------

    const pythonScript = path.join(
      __dirname,
      "..",
      "..",
      "ml-service",
      "computer_vision.py"
    );

    console.log(
      "Script Computer Vision :",
      pythonScript
    );

    console.log(
      "Vidéo analysée :",
      videoPath
    );

    // ----------------------------------------------------------
    // Vérifier que le script Python existe
    // ----------------------------------------------------------

    if (!fs.existsSync(pythonScript)) {
      return reject(
        new Error(
          `Script Computer Vision introuvable : ${pythonScript}`
        )
      );
    }

    // ----------------------------------------------------------
    // Lancer Python
    // ----------------------------------------------------------

    console.log(
      "Lancement du processus Python..."
    );

    const pythonProcess = spawn(
      "python",
      [
        pythonScript,
        videoPath,
      ],
      {
        windowsHide: true,
      }
    );

    let stdout = "";
    let stderr = "";

    // ----------------------------------------------------------
    // STDOUT Python
    // ----------------------------------------------------------

    pythonProcess.stdout.on(
      "data",
      (data) => {
        const output = data.toString();

        stdout += output;

        console.log(
          "🐍 Python STDOUT :",
          output.trim()
        );
      }
    );

    // ----------------------------------------------------------
    // STDERR Python
    // ----------------------------------------------------------

    pythonProcess.stderr.on(
      "data",
      (data) => {
        const output = data.toString();

        stderr += output;

        console.error(
          "🐍 Python STDERR :",
          output.trim()
        );
      }
    );

    // ----------------------------------------------------------
    // Erreur de lancement du processus
    // ----------------------------------------------------------

    pythonProcess.on(
      "error",
      (error) => {
        console.error(
          "❌ Impossible de lancer Python :"
        );

        console.error(
          error
        );

        reject(
          new Error(
            `Impossible de lancer Python : ${error.message}`
          )
        );
      }
    );

    // ----------------------------------------------------------
    // Fin du processus
    // ----------------------------------------------------------

    pythonProcess.on(
      "close",
      (code) => {
        console.log(
          "Computer Vision terminé. Code :",
          code
        );

        // ------------------------------------------------------
        // Python a échoué
        // ------------------------------------------------------

        if (code !== 0) {
          console.error("");
          console.error(
            "❌ COMPUTER VISION ÉCHOUÉE"
          );

          console.error(
            "Code Python :",
            code
          );

          console.error(
            "STDOUT Python :",
            stdout || "(vide)"
          );

          console.error(
            "STDERR Python :",
            stderr || "(vide)"
          );

          let errorMessage =
            stderr.trim() ||
            stdout.trim() ||
            `Le script Computer Vision s'est terminé avec le code ${code}.`;

          return reject(
            new Error(
              `Erreur Computer Vision : ${errorMessage}`
            )
          );
        }

        // ------------------------------------------------------
        // Vérifier la réponse Python
        // ------------------------------------------------------

        const cleanOutput =
          stdout.trim();

        if (!cleanOutput) {
          console.error(
            "❌ Python n'a retourné aucune donnée."
          );

          return reject(
            new Error(
              "Computer Vision n'a retourné aucun résultat."
            )
          );
        }

        console.log(
          "📦 Résultat Python reçu."
        );

        console.log(
          "Résultat brut :",
          cleanOutput
        );

        // ------------------------------------------------------
        // Parser le JSON
        // ------------------------------------------------------

        try {
          const result =
            JSON.parse(cleanOutput);

          // ----------------------------------------------------
          // Python indique lui-même une erreur
          // ----------------------------------------------------

          if (
            result.status ===
            "FAILED"
          ) {
            return reject(
              new Error(
                result.error ||
                  "Erreur Computer Vision."
              )
            );
          }

          // ----------------------------------------------------
          // Vérifier le statut
          // ----------------------------------------------------

          if (
            result.status &&
            result.status !== "COMPLETED" &&
            result.status !== "SUCCESS"
          ) {
            console.warn(
              "⚠️ Statut Computer Vision inattendu :",
              result.status
            );
          }

          console.log(
            "✅ Computer Vision terminée avec succès."
          );

          resolve(result);
        } catch (error) {
          console.error(
            "❌ Réponse Python invalide."
          );

          console.error(
            "JSON reçu :",
            cleanOutput
          );

          console.error(
            "Erreur JSON :",
            error.message
          );

          reject(
            new Error(
              "Réponse Computer Vision invalide. Vérifie que computer_vision.py retourne uniquement un JSON."
            )
          );
        }
      }
    );
  });
}

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  analyzeInterviewVideo,
};