const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true, unique: false },
    industry: String,
    website: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
