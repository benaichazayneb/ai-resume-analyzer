/**
 * healthController.js
 * ---------------------------------------------------------
 * Contrôleur simple permettant de vérifier que l'API est en
 * ligne. Utilisé pour les checks de santé (health checks) en
 * développement, en CI et en production (ex: monitoring, load
 * balancer, docker healthcheck).
 */

const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
};

module.exports = { getHealth };
