const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const auth = require('../middleware/auth');

// Add Progress
router.post('/', auth, async (req, res) => {
  try {
    const { weight, bodyFat, notes } = req.body;
    const newProgress = new Progress({
      userId: req.user.id,
      weight,
      bodyFat,
      notes,
      date: new Date()
    });
    await newProgress.save();
    res.json(newProgress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Progress History (for chart)
router.get('/', auth, async (req, res) => {
  try {
    const history = await Progress.find({ userId: req.user.id }).sort({ date: 1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
