const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api/payments/verify';

const payload = {
    "razorpay_payment_id": "pay_29QQoUBi66xm2f",
    "razorpay_order_id": "order_9A33XWu170gUtm",
    "razorpay_signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d",
    "userId": "676865a7f282479e782ea387", // Replace with a valid User ID from your DB if needed for the test to fully pass logic
    "amount": 500
};

// We need a valid user ID for the backend to update the wallet.
// For this test, we might just fail on "User not found" or "Signature" depends on what hits first.
// The backend checks signature FIRST.

async function testverify() {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);
    } catch (e) {
        console.error('Error:', e);
    }
}

testverify();
