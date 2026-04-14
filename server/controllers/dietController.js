const DietEntry = require('../models/DietEntry');
const Food      = require('../models/Food');

// POST /api/diet
exports.logFood = async (req, res) => {
  try {
    const entry = await DietEntry.create({ ...req.body, userId: req.user._id });
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET /api/diet/today
exports.getToday = async (req, res) => {
  try {
    const start = new Date(); start.setHours(0,0,0,0);
    const end   = new Date(); end.setHours(23,59,59,999);
    const entries = await DietEntry.find({
      userId: req.user._id,
      loggedAt: { $gte: start, $lte: end }
    }).sort({ loggedAt: 1 });

    const totals = entries.reduce((acc, e) => ({
      calories: acc.calories + e.calories,
      protein:  acc.protein  + e.protein,
      carbs:    acc.carbs    + e.carbs,
      fat:      acc.fat      + e.fat,
      fiber:    acc.fiber    + e.fiber,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

    res.json({ entries, totals });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET /api/diet/history
exports.getHistory = async (req, res) => {
  try {
    const { limit = 30 } = req.query;
    const entries = await DietEntry.find({ userId: req.user._id })
      .sort({ loggedAt: -1 }).limit(Number(limit));
    res.json(entries);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// DELETE /api/diet/:id
exports.deleteEntry = async (req, res) => {
  try {
    await DietEntry.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET /api/diet/foods?search=
exports.searchFoods = async (req, res) => {
  try {
    const { search = '' } = req.query;
    const foods = await Food.find({
      name: { $regex: search, $options: 'i' }
    }).limit(10);
    res.json(foods);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
