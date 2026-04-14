// WHO / AHA health metric thresholds
const THRESHOLDS = {
  heartRate: {
    normal:    [60, 100],
    caution:   { low: [50, 59], high: [101, 119] },
    dangerLow:  50,
    dangerHigh: 120,
    unit: 'bpm',
    label: 'Heart Rate',
    messages: {
      Low:      'Your heart rate is slightly outside normal. Monitor closely.',
      Moderate: 'Your heart rate is in the caution range. Consider consulting a doctor.',
      High:     'Your heart rate is critically elevated or too low. Seek medical attention immediately.',
    }
  },
  systolicBP: {
    normal:    [90, 120],
    caution:   { high: [121, 139] },
    dangerLow:  90,
    dangerHigh: 140,
    unit: 'mmHg',
    label: 'Systolic Blood Pressure',
    messages: {
      Low:      'Systolic BP is slightly outside normal range.',
      Moderate: 'Pre-hypertension detected. Reduce salt intake and manage stress.',
      High:     'Hypertensive crisis range. Seek immediate medical attention.',
    }
  },
  diastolicBP: {
    normal:    [60, 80],
    caution:   { high: [81, 89] },
    dangerLow:  60,
    dangerHigh: 90,
    unit: 'mmHg',
    label: 'Diastolic Blood Pressure',
    messages: {
      Low:      'Diastolic BP is slightly outside normal range.',
      Moderate: 'Mild diastolic hypertension. Monitor closely.',
      High:     'Diastolic BP is critically high. Consult a doctor immediately.',
    }
  },
  bmi: {
    normal:    [18.5, 24.9],
    caution:   { high: [25.0, 29.9] },
    dangerLow:  18.5,
    dangerHigh: 30.0,
    unit: 'kg/m²',
    label: 'BMI',
    messages: {
      Low:      'BMI is outside normal range. Review your diet and activity.',
      Moderate: 'Overweight range. Consider diet and exercise adjustments.',
      High:     'Obese or underweight range. Please consult a healthcare provider.',
    }
  },
  sleepDuration: {
    normal:    [7, 9],
    caution:   { low: [6, 6.9], high: [9, 10] },
    dangerLow:  6,
    dangerHigh: 10,
    unit: 'hours',
    label: 'Sleep Duration',
    messages: {
      Low:      'Sleep slightly outside recommended range.',
      Moderate: 'Sleep duration is suboptimal. Establish a regular sleep schedule.',
      High:     'Severely insufficient or excessive sleep. Consult a doctor.',
    }
  },
  spo2: {
    normal:    [95, 100],
    caution:   { low: [91, 94] },
    dangerLow:  90,
    dangerHigh: 100,
    unit: '%',
    label: 'Blood Oxygen (SpO2)',
    messages: {
      Low:      'SpO2 slightly low. Take deep breaths and rest.',
      Moderate: 'SpO2 in caution range. Seek medical advice if it persists.',
      High:     'Critically low oxygen saturation. Seek emergency medical care.',
    }
  }
};

module.exports = THRESHOLDS;
