const { verifyToken } = require('./middleware/auth');
const jwt = require('jsonwebtoken');

// Mock helpers
const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.body = data;
        return res;
    };
    return res;
};

const mockNext = () => {
    return 'NEXT_CALLED';
};

console.log('🧪 Testing Auth Middleware...');

// Test 1: Missing Token
const req1 = { header: () => null };
const res1 = mockRes();
verifyToken(req1, res1, mockNext);

if (res1.statusCode === 401 && res1.body.error === 'Access denied. No token provided.') {
    console.log('✅ Test 1 Passed: Missing token returns 401');
} else {
    console.error('❌ Test 1 Failed:', res1);
}

// Test 2: Invalid Token
const req2 = { header: () => 'Bearer invalidtoken' };
const res2 = mockRes();
verifyToken(req2, res2, mockNext);

if (res2.statusCode === 400 && res2.body.error === 'Invalid token') {
    console.log('✅ Test 2 Passed: Invalid token returns 400');
} else {
    console.error('❌ Test 2 Failed:', res2);
}

// Test 3: Valid Token
const secret = process.env.JWT_SECRET || 'force_super_secret_key';
const token = jwt.sign({ id: '123', role: 'PLAYER' }, secret);
const req3 = { header: () => `Bearer ${token}` };
const res3 = mockRes();
let nextCalled = false;
verifyToken(req3, res3, () => { nextCalled = true; });

if (nextCalled && req3.user && req3.user.id === '123') {
    console.log('✅ Test 3 Passed: Valid token calls next() and sets req.user');
} else {
    console.error('❌ Test 3 Failed:', { nextCalled, user: req3.user });
}
