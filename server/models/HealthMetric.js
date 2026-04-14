const mongoose = require('mongoose');

const healthMetricSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  heartRate:    { type: Number, min: 0, max: 300 },   // bpm
  systolicBP:   { type: Number, min: 0, max: 300 },   // mmHg
  diastolicBP:  { type: Number, min: 0, max: 200 },   // mmHg
  weight:       { type: Number, min: 0, max: 500 },   // kg
  bmi:          { type: Number },                      // auto-calculated
  sleepDuration:{ type: Number, min: 0, max: 24 },    // hours
  hydration:    { type: Number, min: 0, max: 20 },    // litres
  spo2:         { type: Number, min: 0, max: 100 },   // %
  recordedAt:   { type: Date, default: Date.now },
}, { timestamps: true });

healthMetricSchema.index({ userId: 1, recordedAt: -1 });

module.exports = mongoose.model('HealthMetric', healthMetricSchema);
