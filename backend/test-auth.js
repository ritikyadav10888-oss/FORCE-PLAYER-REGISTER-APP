const jwt = require('jsonwebtoken');

// Matches server.js default if env is missing
const JWT_SECRET = process.env.JWT_SECRET || 'force_super_secret_key';
const API_URL = 'http://localhost:5000/api';

async function testAuthSuite() {
    console.log('🔐 Running Auth Security Test Suite...\n');

    // 1. Unauthenticated Access (Should Fail)
    console.log('--- Test 1: Unauthenticated Access ---');
    try {
        const response = await fetch(`${API_URL}/tournaments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: "Hacked Tournament" })
        });
        const data = await response.json();
        if (response.status === 401) {
            console.log('✅ PASS: Request blocked (401 Unauthorized)');
        } else {
            console.log(`❌ FAIL: Expected 401, got ${response.status}`);
        }
    } catch (e) { console.error('Error:', e.message); }

    // 2. Unauthorized Access (Wrong Role)
    console.log('\n--- Test 2: Unauthorized Access (Player trying to create Tournament) ---');
    try {
        const token = jwt.sign({ id: 'player123', role: 'PLAYER' }, JWT_SECRET, { expiresIn: '1h' });
        const response = await fetch(`${API_URL}/tournaments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: "Player Tournament" })
        });
        const data = await response.json();
        if (response.status === 403) {
            console.log('✅ PASS: Request blocked (403 Forbidden)');
        } else {
            console.log(`❌ FAIL: Expected 403, got ${response.status}`);
        }
    } catch (e) { console.error('Error:', e.message); }

    // 3. Unauthorized Access (Updating Other User)
    console.log('\n--- Test 3: Unauthorized Access (Updating Other User) ---');
    try {
        const token = jwt.sign({ id: 'user1', role: 'PLAYER' }, JWT_SECRET, { expiresIn: '1h' });
        const response = await fetch(`${API_URL}/users/user2`, { // Mismatched ID
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: "Hacked Name" })
        });
        const data = await response.json();
        if (response.status === 403) {
            console.log('✅ PASS: Request blocked (403 Forbidden)');
        } else {
            console.log(`❌ FAIL: Expected 403, got ${response.status}`);
        }
    } catch (e) { console.error('Error:', e.message); }

    // 4. Authorized Access (Should Pass Auth Layer)
    console.log('\n--- Test 4: Authorized Access (Organizer creating Tournament) ---');
    try {
        const token = jwt.sign({ id: 'org123', role: 'ORGANIZER' }, JWT_SECRET, { expiresIn: '1h' });
        const response = await fetch(`${API_URL}/tournaments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: "Legit Tournament", organizerId: "org123" })
        });

        if (response.status === 401 || response.status === 403) {
            console.log(`❌ FAIL: Valid request blocked with ${response.status}`);
        } else {
            console.log(`✅ PASS: Auth succeeded (Server responded with ${response.status}, likely DB error which is expected)`);
        }
    } catch (e) { console.error('Error:', e.message); }

    console.log('\n✅ Auth Test Suite Complete.');
}

testAuthSuite();
