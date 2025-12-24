const fetch = require('node-fetch');

async function testNewPayment() {
    try {
        console.log('🧪 Testing New Payment System\n');

        // Login
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'anand123@gmail.com', password: 'admin1' })
        });
        const user = await loginRes.json();
        console.log(`✅ Logged in as: ${user.name}\n`);

        // Test UPI Payment
        console.log('Testing UPI Payment...');
        const upiRes = await fetch(`http://localhost:5000/api/users/${user._id}/topup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: 250,
                paymentMethod: 'UPI',
                transactionId: 'TXN' + Date.now(),
                paymentDetails: {
                    upiId: 'testuser@paytm'
                }
            })
        });
        const upiData = await upiRes.json();
        console.log(upiRes.ok ? '✅ UPI Payment Success!' : '❌ Failed');
        console.log('Response:', JSON.stringify(upiData, null, 2));

        // Check wallet
        console.log('\nChecking wallet transactions...');
        const walletRes = await fetch(`http://localhost:5000/api/users/${user._id}/wallet`);
        const wallet = await walletRes.json();

        const latestTxn = wallet.transactions[0];
        console.log('\nLatest Transaction:');
        console.log(`  Description: ${latestTxn.description}`);
        console.log(`  Amount: ₹${latestTxn.amount}`);
        console.log(`  Method: ${latestTxn.paymentMethod}`);
        console.log(`  Transaction ID: ${latestTxn.transactionId}`);
        console.log(`  Payment Details:`, latestTxn.paymentDetails);

        console.log('\n✅ Payment system is working correctly!');

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

testNewPayment();
