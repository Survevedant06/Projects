const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Basic, Intermediate, Advanced
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Plan', planSchema);
