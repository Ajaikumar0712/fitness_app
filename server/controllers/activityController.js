const Activity        = require('../models/Activity');
const { calcCalories, MET_VALUES } = require('../utils/calculations');

// POST /api/activity
exports.logActivity = async (req, res) => {
  try {
    const { type, durationMinutes, intensity, distance, notes } = req.body;
    const met = MET_VALUES[type] || 4.0;
    const weight = req.user.weight || 70;
    const caloriesBurned = calcCalories(type, weight, durationMinutes);

    const activity = await Activity.create({
      userId: req.user._id, type, metValue: met,
      durationMinutes, caloriesBurned, distance, intensity, notes
    });
    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET /api/activity
exports.getActivities = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const activities = await Activity.find({ userId: req.user._id })
      .sort({ loggedAt: -1 }).limit(Number(limit));
    res.json(activities);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET /api/activity/weekly
exports.getWeekly = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const activities = await Activity.find({
      userId: req.user._id,
      loggedAt: { $gte: sevenDaysAgo }
    });

    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const weekly = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const label = days[d.getDay()];
      const dayActivities = activities.filter(a => {
        const at = new Date(a.loggedAt);
        return at.toDateString() === d.toDateString();
      });
      return {
        day: label,
        date: d.toISOString().split('T')[0],
        activeMinutes: dayActivities.reduce((s, a) => s + a.durationMinutes, 0),
        calories: dayActivities.reduce((s, a) => s + a.caloriesBurned, 0),
        sessions: dayActivities.length,
      };
    });
    res.json(weekly);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// PUT /api/activity/:id
exports.updateActivity = async (req, res) => {
  try {
    const activity = await Activity.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id }, req.body, { new: true }
    );
    if (!activity) return res.status(404).json({ msg: 'Not found' });
    res.json(activity);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// DELETE /api/activity/:id
exports.deleteActivity = async (req, res) => {
  try {
    await Activity.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
