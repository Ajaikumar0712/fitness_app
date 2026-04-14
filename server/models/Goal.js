const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:         { type: String, required: true },
  targetValue:  { type: Number, required: true },
  currentValue: { type: Number, default: 0 },
  unit:         { type: String, required: true },
  startDate:    { type: Date, default: Date.now },
  endDate:      { type: Date, required: true },
  status:       { type: String, enum: ['Active','Achieved','Overdue','Paused'], default: 'Active' },
}, { timestamps: true });

goalSchema.index({ userId: 1 });

module.exports = mongoose.model('Goal', goalSchema);
