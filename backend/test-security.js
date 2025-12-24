// Security Testing Script for Force App
// Run this to test all security features

const testSecurity = async () => {
    const API_URL = 'http://localhost:5000/api';

    console.log('🔐 Force App Security Test Suite\n');
    console.log('='.repeat(50));

    // Test 1: Password Strength Validation
    console.log('\n📋 Test 1: Password Strength Validation');
    console.log('-'.repeat(50));

    const weakPasswords = [
        { password: 'weak', reason: 'Too short, no uppercase, no special char' },
        { password: 'password123', reason: 'No uppercase, no special char' },
        { password: 'Password', reason: 'No number, no special char' },
        { password: '12345678', reason: 'No letters' },
        { password: 'Password1', reason: 'No special char' },
    ];

    console.log('Testing weak passwords (should all FAIL):');
    for (const test of weakPasswords) {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'test@force.com',
                    password: test.password,
                    name: 'Test User',
                    role: 'PLAYER'
                })
            });
            const data = await response.json();
            console.log(`  ❌ "${test.password}" - ${data.error || 'Rejected'}`);
        } catch (error) {
            console.log(`  ⚠️  Network error: ${error.message}`);
        }
    }

    console.log('\nTesting strong password (should PASS):');
    const strongPassword = 'MyP@ssw0rd123!';
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: `test${Date.now()}@force.com`,
                password: strongPassword,
                name: 'Test User',
                role: 'PLAYER',
                mobile: '1234567890',
                address: 'Test City'
            })
        });
        const data = await response.json();
        if (response.ok) {
            console.log(`  ✅ "${strongPassword}" - Accepted!`);
        } else {
            console.log(`  ❌ "${strongPassword}" - ${data.error}`);
        }
    } catch (error) {
        console.log(`  ⚠️  Network error: ${error.message}`);
    }

    // Test 2: Rate Limiting
    console.log('\n\n📋 Test 2: Rate Limiting (5 attempts in 15 minutes)');
    console.log('-'.repeat(50));
    console.log('Attempting 6 logins with wrong password...');

    for (let i = 1; i <= 6; i++) {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'test@force.com',
                    password: 'WrongPassword123!'
                })
            });
            const data = await response.json();

            if (response.status === 429) {
                console.log(`  Attempt ${i}: 🚫 RATE LIMITED - ${data.message || data.error}`);
            } else {
                console.log(`  Attempt ${i}: ❌ ${data.error}`);
            }
        } catch (error) {
            console.log(`  Attempt ${i}: ⚠️  Network error: ${error.message}`);
        }

        // Small delay between attempts
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Test 3: Account Lockout
    console.log('\n\n📋 Test 3: Account Lockout (5 failed attempts)');
    console.log('-'.repeat(50));
    console.log('Note: This test requires a real user account');
    console.log('Create a test account first, then try logging in 5 times with wrong password');

    // Test 4: Security Headers
    console.log('\n\n📋 Test 4: Security Headers');
    console.log('-'.repeat(50));
    try {
        const response = await fetch(`${API_URL}/tournaments`);
        const headers = response.headers;

        console.log('Checking security headers:');
        console.log(`  X-Content-Type-Options: ${headers.get('x-content-type-options') || '❌ Missing'}`);
        console.log(`  X-Frame-Options: ${headers.get('x-frame-options') || '❌ Missing'}`);
        console.log(`  X-XSS-Protection: ${headers.get('x-xss-protection') || '❌ Missing'}`);
        console.log(`  Content-Security-Policy: ${headers.get('content-security-policy') ? '✅ Present' : '⚠️  Not set'}`);
    } catch (error) {
        console.log(`  ⚠️  Network error: ${error.message}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Security Test Suite Complete!');
    console.log('='.repeat(50));
    console.log('\nRecommendations:');
    console.log('1. All weak passwords should be rejected ❌');
    console.log('2. Strong passwords should be accepted ✅');
    console.log('3. Rate limiting should block after 5 attempts 🚫');
    console.log('4. Security headers should be present ✅');
    console.log('\nFor account lockout test:');
    console.log('- Create a test user account');
    console.log('- Try logging in 5 times with wrong password');
    console.log('- Account should lock for 30 minutes');
};

// Run the tests
testSecurity().catch(console.error);
