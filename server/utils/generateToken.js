const jwt = require("jsonwebtoken");

/**
 * Génère un JWT signé contenant l'id de l'utilisateur.
 * Durée de validité configurable via JWT_EXPIRES_IN (défaut : 7 jours).
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

module.exports = generateToken;
