import { describe, it, expect } from 'vitest';
import { calcBMI, classifyBMI, calcCaloriesBurned } from './health';

describe('Health Utilities Unit Tests', () => {
    describe('calcBMI', () => {
        it('should calculate BMI correctly', () => {
            // weightKg, heightCm
            expect(calcBMI(70, 175)).toBe(22.9);
            expect(calcBMI(85, 180)).toBe(26.2);
        });

        it('should handle missing data gracefully', () => {
            expect(calcBMI(70, 0)).toBe(null);
            expect(calcBMI(0, 175)).toBe(null);
        });
    });

    describe('classifyBMI', () => {
        it('should return correct categories', () => {
            expect(classifyBMI(18.0).label).toBe('Underweight');
            expect(classifyBMI(22.0).label).toBe('Normal');
            expect(classifyBMI(27.0).label).toBe('Overweight');
            expect(classifyBMI(32.0).label).toBe('Obese');
        });
    });

    describe('calcCaloriesBurned', () => {
        it('should calculate burned calories based on MET', () => {
            // formula: MET * weight * (duration/60)
            // Walking (3.5) * 70kg * (60/60) = 245
            expect(calcCaloriesBurned('Walking', 70, 60)).toBe(245);
        });
    });
});
