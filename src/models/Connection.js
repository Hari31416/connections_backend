const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: String,
    phone: String,
    linkedinUserId: String,
    githubUserId: String,
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Connection", connectionSchema);
