/**
 * server.js
 * ---------------------------------------------------------
 * Point d'entrée de l'application.
 * Charge les variables d'environnement, se connecte à MongoDB,
 * puis démarre le serveur HTTP Express.
 */

require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connexion à MongoDB avant de démarrer l'API
    await connectDB();

    // Démarrage du serveur uniquement si MongoDB est disponible
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error(`❌ Server startup error: ${error.message}`);
    process.exit(1);
  }
};

startServer();