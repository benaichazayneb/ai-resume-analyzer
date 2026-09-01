/**
 * db.js
 * ---------------------------------------------------------
 * Connexion à MongoDB via Mongoose.
 *
 * Appelée une seule fois au démarrage du serveur (server.js),
 * avant app.listen(). En cas d'échec de connexion, le process
 * s'arrête : on ne veut jamais démarrer une API dont la base de
 * données n'est pas joignable.
 */

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
