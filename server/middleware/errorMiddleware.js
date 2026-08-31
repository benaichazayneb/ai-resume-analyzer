/**
 * errorMiddleware.js
 * ---------------------------------------------------------
 * Middlewares transverses de gestion des erreurs.
 *
 * - notFound       : capture les routes inexistantes (404)
 * - errorHandler   : capture toutes les erreurs suivantes et
 *                    renvoie une réponse JSON cohérente
 *
 * Format de réponse standardisé (voir README / spec section 27) :
 *   Succès : { "success": true,  "data": {...} }
 *   Erreur  : { "success": false, "message": "..." }
 */

const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found - ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Si le statut n'a pas déjà été fixé à une erreur, on force 500
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    // La stack trace n'est renvoyée qu'en développement
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
