const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  metricType:  { type: String, required: true },
  value:       { type: Number, required: true },
  threshold:   { type: String },
  severity:    { type: String, enum: ['Low','Moderate','High'], required: true },
  message:     { type: String, default: '' },
  isRead:      { type: Boolean, default: false },
}, { timestamps: true });

alertSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
