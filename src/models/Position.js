const mongoose = require("mongoose");

const positionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    connectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Connection",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    title: { type: String, required: true },
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false },
    notes: String,
  },
  { timestamps: true }
);

// Compound index to ensure a connection can only have one position per company at a time
positionSchema.index(
  { connectionId: 1, companyId: 1, userId: 1 },
  { unique: false }
);

module.exports = mongoose.model("Position", positionSchema);
