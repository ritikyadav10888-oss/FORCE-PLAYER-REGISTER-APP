const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api';

async function testPaymentSystem() {
    console.log('🧪 TESTING PAYMENT SYSTEM\n');
    console.log('='.repeat(60));

    // First, login to get a user
    console.log('\n1. Logging in...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'anand123@gmail.com',
            password: 'admin1'
        })
    });
    const user = await loginRes.json();
    console.log(`✅ Logged in as: ${user.name} (${user.role})`);

    // Test 1: UPI Payment
    console.log('\n2. Testing UPI Payment...');
    const upiRes = await fetch(`${API_URL}/users/${user._id}/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            amount: 500,
            paymentMethod: 'UPI',
            transactionId: 'TXN' + Date.now() + '001',
            paymentDetails: {
                upiId: 'testuser@paytm'
            }
        })
    });
    const upiData = await upiRes.json();
    if (upiRes.ok) {
        console.log('✅ UPI Payment Success!');
        console.log(`   Amount: ₹${upiData.transaction.amount}`);
        console.log(`   Method: ${upiData.transaction.paymentMethod}`);
        console.log(`   UPI ID: ${upiData.transaction.paymentDetails.upiId}`);
        console.log(`   New Balance: ₹${upiData.balance}`);
    } else {
        console.log('❌ UPI Payment Failed:', upiData.error);
    }

    // Test 2: Bank Transfer
    console.log('\n3. Testing Bank Transfer...');
    const bankRes = await fetch(`${API_URL}/users/${user._id}/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            amount: 1000,
            paymentMethod: 'BANK',
            transactionId: 'TXN' + Date.now() + '002',
            paymentDetails: {
                accountNumber: '1234567890',
                ifscCode: 'SBIN0001234',
                accountHolder: 'Test User'
            }
        })
    });
    const bankData = await bankRes.json();
    if (bankRes.ok) {
        console.log('✅ Bank Transfer Success!');
        console.log(`   Amount: ₹${bankData.transaction.amount}`);
        console.log(`   Method: ${bankData.transaction.paymentMethod}`);
        console.log(`   Account: ${bankData.transaction.paymentDetails.accountNumber}`);
        console.log(`   IFSC: ${bankData.transaction.paymentDetails.ifscCode}`);
        console.log(`   New Balance: ₹${bankData.balance}`);
    } else {
        console.log('❌ Bank Transfer Failed:', bankData.error);
    }

    // Test 3: Card Payment
    console.log('\n4. Testing Card Payment...');
    const cardRes = await fetch(`${API_URL}/users/${user._id}/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            amount: 750,
            paymentMethod: 'CARD',
            transactionId: 'TXN' + Date.now() + '003',
            paymentDetails: {
                cardLast4: '3456',
                cardHolder: 'TEST USER'
            }
        })
    });
    const cardData = await cardRes.json();
    if (cardRes.ok) {
        console.log('✅ Card Payment Success!');
        console.log(`   Amount: ₹${cardData.transaction.amount}`);
        console.log(`   Method: ${cardData.transaction.paymentMethod}`);
        console.log(`   Card: **** **** **** ${cardData.transaction.paymentDetails.cardLast4}`);
        console.log(`   Holder: ${cardData.transaction.paymentDetails.cardHolder}`);
        console.log(`   New Balance: ₹${cardData.balance}`);
    } else {
        console.log('❌ Card Payment Failed:', cardData.error);
    }

    // Test 4: Check Wallet
    console.log('\n5. Checking Wallet...');
    const walletRes = await fetch(`${API_URL}/users/${user._id}/wallet`);
    const walletData = await walletRes.json();
    console.log(`✅ Wallet Balance: ₹${walletData.balance}`);
    console.log(`   Total Transactions: ${walletData.transactions.length}`);
    console.log('\n   Recent Transactions:');
    walletData.transactions.slice(0, 3).forEach((txn, i) => {
        console.log(`   ${i + 1}. ${txn.description} - ₹${txn.amount} (${txn.paymentMethod})`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('🎉 PAYMENT SYSTEM TEST COMPLETE!');
    console.log('='.repeat(60));
}

testPaymentSystem().catch(err => console.error('❌ Error:', err.message));
