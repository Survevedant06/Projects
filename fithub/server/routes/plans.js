const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all plans
router.get('/', async (req, res) => {
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update current plan
router.post('/select', auth, async (req, res) => {
  try {
    const { planId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.currentPlan = planId;
    user.planStartDate = new Date();
    await user.save();

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
