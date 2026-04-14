const mongoose = require('mongoose');

const dietEntrySchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodName:      { type: String, required: true },
  mealType:      { type: String, enum: ['Breakfast','Lunch','Dinner','Snacks'], required: true },
  quantityGrams: { type: Number, required: true, min: 1 },
  calories:      { type: Number, default: 0 },
  protein:       { type: Number, default: 0 }, // g
  carbs:         { type: Number, default: 0 }, // g
  fat:           { type: Number, default: 0 }, // g
  fiber:         { type: Number, default: 0 }, // g
  loggedAt:      { type: Date, default: Date.now },
}, { timestamps: true });

dietEntrySchema.index({ userId: 1, loggedAt: -1 });

module.exports = mongoose.model('DietEntry', dietEntrySchema);
