const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weight: { type: Number, required: true },
  bodyFat: { type: Number },
  notes: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Progress', progressSchema);
