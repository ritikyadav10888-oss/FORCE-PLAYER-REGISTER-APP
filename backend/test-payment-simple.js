const fetch = require('node-fetch');

async function quickPaymentTest() {
    try {
        console.log('Testing Payment System...\n');

        // Login
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'anand123@gmail.com', password: 'admin1' })
        });
        const user = await loginRes.json();
        console.log('1. Login:', user.name);

        // UPI Payment
        const upiRes = await fetch(`http://localhost:5000/api/users/${user._id}/topup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: 100,
                paymentMethod: 'UPI',
                transactionId: 'TXN123',
                paymentDetails: { upiId: 'test@paytm' }
            })
        });
        const upiData = await upiRes.json();
        console.log('2. UPI Payment:', upiRes.ok ? '✅ Success' : '❌ Failed');
        if (upiRes.ok) {
            console.log('   Balance:', upiData.balance);
            console.log('   Method:', upiData.transaction.paymentMethod);
        } else {
            console.log('   Error:', upiData.error);
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
}

quickPaymentTest();
