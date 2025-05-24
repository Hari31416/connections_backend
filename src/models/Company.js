const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true, unique: false },
  industry: String,
  website: String,
  // Add connections reference array to track all people associated with this company
  connections: [
    {
      connectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Connection" },
      connectionName: String,
      position: String,
    },
  ],
});

module.exports = mongoose.model("Company", companySchema);
