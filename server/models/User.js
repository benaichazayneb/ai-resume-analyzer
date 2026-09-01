const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    // Stocke le hash bcrypt, jamais le mot de passe en clair (voir section 26)
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // exclu par défaut des requêtes find()
    },
  },
  { timestamps: true } // ajoute automatiquement createdAt / updatedAt
);

module.exports = mongoose.model("User", userSchema);
