const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number },
  weight: { type: Number },
  height: { type: Number },
  goal: { type: String, enum: ['Lose Weight', 'Build Muscle', 'Stay Fit'] },
  currentPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  planStartDate: { type: Date },
  currentStreak: { type: Number, default: 0 },
  highestStreak: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
