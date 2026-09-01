const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protège une route : exige un JWT valide dans le header
 * "Authorization: Bearer <token>". Si valide, attache
 * l'utilisateur correspondant (sans son mot de passe) à req.user.
 */
const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      res.status(401);
      throw new Error("Not authorized, no token provided");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id); // password déjà exclu (select:false)

    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, user not found");
    }

    next();
  } catch (error) {
    res.status(res.statusCode && res.statusCode !== 200 ? res.statusCode : 401);
    next(error);
  }
};

module.exports = { protect };
