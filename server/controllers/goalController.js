const Goal = require('../models/Goal');

// POST /api/goals
exports.createGoal = async (req, res) => {
  try {
    const goal = await Goal.create({ ...req.body, userId: req.user._id });
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET /api/goals
exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    // Auto-update overdue status
    const now = new Date();
    for (const g of goals) {
      if (g.status === 'Active' && new Date(g.endDate) < now) {
        g.status = 'Overdue';
        await g.save();
      }
    }
    res.json(goals);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// PUT /api/goals/:id
exports.updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id }, req.body, { new: true }
    );
    if (!goal) return res.status(404).json({ msg: 'Not found' });
    res.json(goal);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// PATCH /api/goals/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: req.body.status }, { new: true }
    );
    res.json(goal);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// DELETE /api/goals/:id
exports.deleteGoal = async (req, res) => {
  try {
    await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
