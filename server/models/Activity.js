const mongoose = require('mongoose');

const MET_VALUES = {
  Walking: 3.5, Running: 8.0, Cycling: 6.0, Swimming: 7.0,
  Yoga: 2.5, WeightTraining: 5.0, HIIT: 8.5, Dancing: 4.5,
  Badminton: 5.5, Cricket: 4.8
};

const activitySchema = new mongoose.Schema({
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:            { type: String, enum: Object.keys(MET_VALUES), required: true },
  metValue:        { type: Number },
  durationMinutes: { type: Number, required: true, min: 1 },
  caloriesBurned:  { type: Number },
  distance:        { type: Number, default: 0 }, // km
  intensity:       { type: String, enum: ['Low','Moderate','High'], default: 'Moderate' },
  notes:           { type: String, default: '' },
  loggedAt:        { type: Date, default: Date.now },
}, { timestamps: true });

activitySchema.index({ userId: 1, loggedAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
