const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Workout = require('../models/Workout');
const WorkoutLog = require('../models/WorkoutLog');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get today's workouts for a user
router.get('/today', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('currentPlan');
    if (!user || !user.currentPlan) return res.status(400).json({ msg: 'No plan selected' });

    // Calculate current day (1-7)
    const startDate = user.planStartDate;
    const diff = Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24));
    const currentDay = (diff % 7) + 1;

    const workouts = await Workout.find({ plan: user.currentPlan._id, dayNumber: currentDay });
    res.json({ workouts, currentDay });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start workout session
router.post('/start', auth, async (req, res) => {
  try {
    const { workoutId } = req.body;
    const newLog = new WorkoutLog({ userId: req.user.id, workoutId, activeSession: true });
    await newLog.save();
    res.json(newLog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Finish workout session
router.post('/finish', auth, async (req, res) => {
  try {
    const { workoutId } = req.body;
    const log = await WorkoutLog.findOne({ userId: req.user.id, workoutId, activeSession: true });
    if (!log) return res.status(400).json({ msg: 'No active session found' });

    const diffMs = new Date() - log.checkIn;
    const diffMins = Math.floor(diffMs / 60000);

    log.durationMinutes = diffMins;
    log.activeSession = false;
    await log.save();

    // Update streak (if not already updated today)
    const user = await User.findById(req.user.id);
    // Simple logic: check if last workout was yesterday
    // For now, just increment
    user.currentStreak += 1;
    if (user.currentStreak > user.highestStreak) user.highestStreak = user.currentStreak;
    await user.save();

    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get History
router.get('/history', auth, async (req, res) => {
  try {
    const history = await WorkoutLog.find({ userId: req.user.id, activeSession: false })
      .populate('workoutId')
      .sort({ checkIn: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Heatmap Data (Last 30 days)
router.get('/heatmap', auth, async (req, res) => {
  try {
    const heatmap = await WorkoutLog.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id), activeSession: false } },
      { $match: { checkIn: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$checkIn" } }, minutes: { $sum: "$durationMinutes" } } }
    ]);
    res.json(heatmap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
