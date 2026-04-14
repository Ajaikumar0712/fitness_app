const MET_VALUES = {
  Walking: 3.5, Running: 8.0, Cycling: 6.0, Swimming: 7.0,
  Yoga: 2.5, WeightTraining: 5.0, HIIT: 8.5, Dancing: 4.5,
  Badminton: 5.5, Cricket: 4.8
};

// Calories = MET × weight(kg) × duration(hrs)
const calcCalories = (type, weightKg, durationMinutes) => {
  const met = MET_VALUES[type] || 4.0;
  return Math.round(met * weightKg * (durationMinutes / 60));
};

// BMI = weight(kg) / (height(m))²
const calcBMI = (weightKg, heightCm) => {
  const h = heightCm / 100;
  return parseFloat((weightKg / (h * h)).toFixed(1));
};

// BMI Classification
const classifyBMI = (bmi) => {
  if (bmi < 18.5) return { label: 'Underweight', color: 'blue' };
  if (bmi < 25)   return { label: 'Normal',      color: 'green' };
  if (bmi < 30)   return { label: 'Overweight',  color: 'orange' };
  return               { label: 'Obese',         color: 'red' };
};

// Harris-Benedict BMR
const calcBMR = (user) => {
  const { gender, weight, height, age } = user;
  if (!weight || !height || !age) return 2000;
  if (gender === 'Male')
    return Math.round(88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age));
  return Math.round(447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age));
};

const ACTIVITY_FACTORS = {
  Sedentary: 1.2, Light: 1.375, Moderate: 1.55, Active: 1.725, VeryActive: 1.9
};

const calcDailyCaloricNeed = (user) => {
  const bmr = calcBMR(user);
  const factor = ACTIVITY_FACTORS[user.activityLevel] || 1.55;
  return Math.round(bmr * factor);
};

module.exports = { calcCalories, calcBMI, classifyBMI, calcBMR, calcDailyCaloricNeed, MET_VALUES };
