// BMI = weight(kg) / (height(m))²
export const calcBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm) return null;
  const h = heightCm / 100;
  return parseFloat((weightKg / (h * h)).toFixed(1));
};

export const classifyBMI = (bmi) => {
  if (!bmi) return { label: 'N/A', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20' };
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-info',    bg: 'bg-info/10',    border: 'border-info/20' };
  if (bmi < 25)   return { label: 'Normal',       color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' };
  if (bmi < 30)   return { label: 'Overweight',   color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' };
  return               { label: 'Obese',          color: 'text-danger',  bg: 'bg-danger/10',  border: 'border-danger/20' };
};

// MET × weight(kg) × duration(hrs)
export const calcCaloriesBurned = (type, weightKg, durationMinutes) => {
  const MET = {
    Walking: 3.5, Running: 8.0, Cycling: 6.0, Swimming: 7.0,
    Yoga: 2.5, WeightTraining: 5.0, HIIT: 8.5, Dancing: 4.5,
    Badminton: 5.5, Cricket: 4.8,
  };
  const met = MET[type] || 4.0;
  return Math.round(met * (weightKg || 70) * (durationMinutes / 60));
};

// Harris-Benedict BMR
export const calcBMR = (user) => {
  const { gender, weight, height, age } = user || {};
  if (!weight || !height || !age) return 2000;
  if (gender === 'Male')
    return Math.round(88.362 + 13.397 * weight + 4.799 * height - 5.677 * age);
  return Math.round(447.593 + 9.247 * weight + 3.098 * height - 4.330 * age);
};

export const calcDailyCaloricNeed = (user) => {
  const bmr = calcBMR(user);
  const f = { Sedentary:1.2, Light:1.375, Moderate:1.55, Active:1.725, VeryActive:1.9 };
  return Math.round(bmr * (f[user?.activityLevel] || 1.55));
};

export const getMetricStatus = (metric, value) => {
  const ranges = {
    heartRate:    { normal: [60, 100], dangerLow: 50, dangerHigh: 120 },
    systolicBP:   { normal: [90, 120], dangerLow: 70, dangerHigh: 140 },
    diastolicBP:  { normal: [60, 80],  dangerLow: 50, dangerHigh: 90  },
    bmi:          { normal: [18.5, 24.9], dangerLow: 15, dangerHigh: 35 },
    sleepDuration:{ normal: [7, 9],    dangerLow: 5,  dangerHigh: 12  },
    spo2:         { normal: [95, 100], dangerLow: 90, dangerHigh: 100 },
  };
  const r = ranges[metric];
  if (!r || value === undefined || value === null) return 'unknown';
  if (value < r.dangerLow || value > r.dangerHigh) return 'danger';
  if (value < r.normal[0] || value > r.normal[1]) return 'caution';
  return 'normal';
};

export const statusColors = {
  normal:  { ring: 'border-success', text: 'text-success', bg: 'bg-success/10',  badge: 'badge-normal'  },
  caution: { ring: 'border-warning', text: 'text-warning', bg: 'bg-warning/10',  badge: 'badge-caution' },
  danger:  { ring: 'border-danger',  text: 'text-danger',  bg: 'bg-danger/10',   badge: 'badge-danger'  },
  unknown: { ring: 'border-white/10',text: 'text-slate-400', bg: 'bg-white/5',   badge: 'badge-info'    },
};

export const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
export const formatTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
export const daysSince   = (d) => Math.floor((Date.now() - new Date(d)) / 86400000);
