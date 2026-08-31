/**
 * app.js
 * ---------------------------------------------------------
 * Configuration de l'application Express :
 *   - middlewares globaux de sécurité et de parsing
 *   - montage des routes
 *   - gestion centralisée des erreurs
 *
 * Ce fichier n'écoute PAS le port lui-même : c'est le rôle de
 * server.js. Cette séparation facilite les tests (ex: supertest
 * peut importer `app` sans démarrer un vrai serveur réseau).
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const healthRoutes = require("./routes/healthRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// --- Middlewares de sécurité ---
app.use(helmet());
app.use(cors());

// --- Parsing du body ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.get("/", (req, res) => {
  res.json({ success: true, message: "Welcome to AI Resume Analyzer API" });
});

app.use("/api/health", healthRoutes);

// Les routes suivantes seront ajoutées progressivement :
// app.use("/api/auth", authRoutes);          // Phase 4
// app.use("/api/resumes", resumeRoutes);     // Phase 6
// app.use("/api/jobs", jobRoutes);           // Phase 10
// app.use("/api/analysis", analysisRoutes);  // Phase 10
// app.use("/api/ai", aiRoutes);              // Phase 11

// --- Gestion des erreurs (toujours en dernier) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
