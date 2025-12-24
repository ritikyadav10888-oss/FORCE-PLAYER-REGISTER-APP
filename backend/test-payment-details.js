const fetch = require('node-fetch');

async function testPaymentDetails() {
    try {
        // Login
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'anand123@gmail.com', password: 'admin1' })
        });
        const user = await loginRes.json();

        // Check wallet to see transaction details
        const walletRes = await fetch(`http://localhost:5000/api/users/${user._id}/wallet`);
        const wallet = await walletRes.json();

        console.log('Recent Transactions:');
        wallet.transactions.slice(0, 3).forEach((txn, i) => {
            console.log(`\n${i + 1}. ${txn.description}`);
            console.log(`   Amount: ₹${txn.amount}`);
            console.log(`   Method: ${txn.paymentMethod || 'N/A'}`);
            console.log(`   Transaction ID: ${txn.transactionId || 'N/A'}`);
            if (txn.paymentDetails) {
                console.log(`   Details:`, JSON.stringify(txn.paymentDetails));
            }
        });

    } catch (err) {
        console.error('Error:', err.message);
    }
}

testPaymentDetails();
