/**
 * server.js
 * ---------------------------------------------------------
 * Point d'entrée de l'application. Charge les variables
 * d'environnement, puis démarre le serveur HTTP Express.
 *
 * La connexion à MongoDB sera ajoutée en Phase 3
 * (via config/db.js, appelée ici avant app.listen).
 */

require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
});
