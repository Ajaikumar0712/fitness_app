const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true },
  password:      { type: String, required: true, minlength: 8 },
  age:           { type: Number, min: 1, max: 120 },
  gender:        { type: String, enum: ['Male', 'Female', 'Other'] },
  height:        { type: Number }, // cm
  weight:        { type: Number }, // kg
  activityLevel: { type: String, enum: ['Sedentary','Light','Moderate','Active','VeryActive'], default: 'Moderate' },
  profileImage:  { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
