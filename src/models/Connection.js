const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  email: String,
  phone: String,
  companies: [
    {
      companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
      companyName: String,
      position: String,
      startDate: Date,
      endDate: Date,
    },
  ],
  notes: String,
});

module.exports = mongoose.model('Connection', connectionSchema);