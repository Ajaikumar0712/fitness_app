const HealthMetric = require('../models/HealthMetric');
const Alert        = require('../models/Alert');
const THRESHOLDS   = require('../utils/thresholds');
const { calcBMI }  = require('../utils/calculations');

// POST /api/health
exports.logMetric = async (req, res) => {
  try {
    const data = { ...req.body, userId: req.user._id };

    // Auto-calculate BMI if weight and height available
    const w = data.weight || req.user.weight;
    const h = req.user.height;
    if (w && h) data.bmi = calcBMI(w, h);

    const metric = await HealthMetric.create(data);

    // Run alert engine
    for (const [key, range] of Object.entries(THRESHOLDS)) {
      const val = data[key];
      if (val === undefined || val === null) continue;
      let severity = null;
      if (val < range.dangerLow || val > range.dangerHigh) severity = 'High';
      else if (val < range.normal[0] || val > range.normal[1]) severity = 'Moderate';
      if (severity) {
        await Alert.create({
          userId: req.user._id,
          metricType: key,
          value: val,
          threshold: JSON.stringify({ normal: range.normal }),
          severity,
          message: range.messages[severity] || '',
        });
      }
    }

    res.status(201).json(metric);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET /api/health
exports.getMetrics = async (req, res) => {
  try {
    const { from, to, limit = 30 } = req.query;
    const filter = { userId: req.user._id };
    if (from || to) {
      filter.recordedAt = {};
      if (from) filter.recordedAt.$gte = new Date(from);
      if (to)   filter.recordedAt.$lte = new Date(to);
    }
    const metrics = await HealthMetric.find(filter).sort({ recordedAt: -1 }).limit(Number(limit));
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET /api/health/latest
exports.getLatest = async (req, res) => {
  try {
    const metric = await HealthMetric.findOne({ userId: req.user._id }).sort({ recordedAt: -1 });
    res.json(metric);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// PUT /api/health/:id
exports.updateMetric = async (req, res) => {
  try {
    const metric = await HealthMetric.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id }, req.body, { new: true }
    );
    if (!metric) return res.status(404).json({ msg: 'Record not found' });
    res.json(metric);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// DELETE /api/health/:id
exports.deleteMetric = async (req, res) => {
  try {
    await HealthMetric.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
