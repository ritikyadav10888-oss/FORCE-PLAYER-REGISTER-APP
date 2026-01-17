const request = require('supertest');

// Mock dependencies BEFORE importing server
jest.mock('mongoose', () => {
    const actual = jest.requireActual('mongoose');
    return {
        ...actual,
        connect: jest.fn().mockResolvedValue(),
        model: jest.fn().mockReturnValue({}),
        Schema: actual.Schema,
    };
});

jest.mock('razorpay', () => {
    return class Razorpay {
        constructor() {}
    };
});

jest.mock('./models/User', () => ({
    findByIdAndUpdate: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
}));

jest.mock('./models/Tournament', () => ({
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
}));

jest.mock('./services/emailService', () => ({
    sendWelcomeEmail: jest.fn(),
}));

// Import server
const app = require('./server');
const User = require('./models/User');

describe('Security Fix Verification', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should reject unauthenticated user update with 401', async () => {
        const res = await request(app)
            .put('/api/users/123')
            .send({ name: 'Updated Name' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({ error: 'Access denied. No token provided.' });
        expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    // Optional: Test with invalid token
    it('should reject invalid token with 401', async () => {
        const res = await request(app)
            .put('/api/users/123')
            .set('Authorization', 'Bearer invalid_token')
            .send({ name: 'Updated Name' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({ error: 'Invalid token' });
        expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
    });
});
