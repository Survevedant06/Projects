const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  dayNumber: { type: Number, required: true }, // 1-7
  workoutName: { type: String, required: true },
  sets: { type: Number },
  reps: { type: Number },
  workoutLink: { type: String }, // Link to guide
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Workout', workoutSchema);
