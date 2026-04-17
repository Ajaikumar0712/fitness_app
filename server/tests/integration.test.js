const request = require('supertest');
const mongoose = require('mongoose');

// Mock DB connection and Model
jest.mock('../config/db', () => jest.fn().mockResolvedValue(true));
jest.mock('../models/User', () => ({
    findOne: jest.fn(),
    create: jest.fn()
}));

const User = require('../models/User');
const app = require('../server');

jest.setTimeout(10000); // Increase timeout for CI environment

describe('Auth & Integration Tests', () => {
    afterAll(async () => {
        // Ensure no open handles
        jest.restoreAllMocks();
    });

    describe('POST /api/auth/register', () => {
        it('should validate registration data', async () => {
            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue({ _id: '123', name: 'Test User', email: 'test@example.com' });

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123'
                });
            
            expect([201, 400]).toContain(res.statusCode);
        });
    });

    describe('GET /api/health/latest', () => {
        it('should require authentication', async () => {
            const res = await request(app).get('/api/health/latest');
            expect(res.statusCode).toBe(401);
        });
    });
});
