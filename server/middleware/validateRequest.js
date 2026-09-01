const { validationResult } = require("express-validator");

/**
 * A placer après un tableau de règles express-validator (body(), etc.)
 * Si des erreurs de validation existent, renvoie une 400 avec un message
 * clair au lieu de laisser la requête atteindre le contrôleur.
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400);
    return next(new Error(errors.array().map((e) => e.msg).join(", ")));
  }

  next();
};

module.exports = validateRequest;
