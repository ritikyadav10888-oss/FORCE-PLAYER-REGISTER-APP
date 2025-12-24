const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api';

async function testWalletBackend() {
    console.log('🧪 TESTING WALLET BACKEND FEATURES');
    console.log('='.repeat(40));

    try {
        // 1. Register/Login a User
        console.log('\n👤 Step 1: Creating Test User...');
        const email = `wallet_test_${Date.now()}@test.com`;
        const registerRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Wallet Tester',
                email: email,
                password: 'Password123!',
                role: 'PLAYER'
            })
        });
        const userData = await registerRes.json();
        const userId = userData._id;
        console.log(`   User created: ${email} (ID: ${userId})`);

        if (!userId) throw new Error('Failed to create user');

        // 2. Set Wallet PIN
        console.log('\n🔐 Step 2: Setting Wallet PIN...');
        const pinRes = await fetch(`${API_URL}/users/${userId}/pin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin: '1234', password: 'Password123!' })
        });
        const pinData = await pinRes.json();
        console.log(`   Result: ${JSON.stringify(pinData)}`);
        if (!pinRes.ok) throw new Error(pinData.error);


        // 3. Verify PIN (Internal Check)
        console.log('\n✅ Step 3: Verifying PIN (Correct)...');
        const verifyRes = await fetch(`${API_URL}/users/${userId}/pin/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin: '1234' })
        });
        const verifyData = await verifyRes.json();
        console.log(`   Result: ${JSON.stringify(verifyData)}`);
        if (!verifyData.success) throw new Error('PIN verification failed');

        console.log('\n❌ Step 4: Verifying PIN (Incorrect)...');
        const badPinRes = await fetch(`${API_URL}/users/${userId}/pin/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin: '9999' })
        });
        if (badPinRes.status === 401) {
            console.log('   Success: Incorrect PIN was rejected.');
        } else {
            console.error('   Failed: Incorrect PIN was NOT rejected.');
        }

        // 4. Test Withdrawal
        console.log('\n💸 Step 5: Testing Withdrawal (₹100)...');
        // First topup technically needed if balance 0, but default is 10000
        const withdrawRes = await fetch(`${API_URL}/users/${userId}/withdraw`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: 100,
                upiId: 'test@upi',
                pin: '1234'
            })
        });
        const withdrawData = await withdrawRes.json();
        console.log(`   Result: ${JSON.stringify(withdrawData)}`);

        if (withdrawRes.ok) {
            console.log(`   New Balance: ₹${withdrawData.balance}`);
        } else {
            console.error(`   Withdrawal Failed: ${withdrawData.error}`);
        }

        console.log('\n✨ WALLET BACKEND TEST COMPLETE');

    } catch (e) {
        console.error('\n❌ CRITICAL ERROR:', e.message);
    }
}

testWalletBackend();
