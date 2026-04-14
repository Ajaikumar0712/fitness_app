const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name:            { type: String, required: true, unique: true },
  per100gCalories: { type: Number, required: true },
  protein:         { type: Number, default: 0 },
  carbs:           { type: Number, default: 0 },
  fat:             { type: Number, default: 0 },
  fiber:           { type: Number, default: 0 },
  saturatedFat:    { type: Number, default: 0 },
  category:        { type: String, default: 'General' },
});

module.exports = mongoose.model('Food', foodSchema);
