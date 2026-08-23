const mongoose = require('mongoose');

const workoutLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workout', required: true },
  checkIn: { type: Date, default: Date.now },
  durationMinutes: { type: Number, default: 0 },
  activeSession: { type: Boolean, default: false } // Boolean to mark as active
});

module.exports = mongoose.model('WorkoutLog', workoutLogSchema);
