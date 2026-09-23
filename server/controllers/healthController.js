/**
 * Contrôleur simple permettant de vérifier que l'API est en
 * ligne.
 */

const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
};

module.exports = { getHealth };
