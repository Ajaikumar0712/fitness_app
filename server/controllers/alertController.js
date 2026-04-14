const Alert = require('../models/Alert');

// GET /api/alerts
exports.getAlerts = async (req, res) => {
  try {
    const { severity } = req.query;
    const filter = { userId: req.user._id };
    if (severity) filter.severity = severity;
    const alerts = await Alert.find(filter).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Alert.countDocuments({ userId: req.user._id, isRead: false });
    res.json({ alerts, unreadCount });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// PATCH /api/alerts/:id/read
exports.markRead = async (req, res) => {
  try {
    await Alert.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isRead: true });
    res.json({ msg: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// PATCH /api/alerts/readall
exports.markAllRead = async (req, res) => {
  try {
    await Alert.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    res.json({ msg: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// DELETE /api/alerts/:id
exports.deleteAlert = async (req, res) => {
  try {
    await Alert.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
