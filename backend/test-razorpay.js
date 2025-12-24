require('dotenv').config();
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

console.log('Testing Razorpay with Key:', process.env.RAZORPAY_KEY_ID);

razorpay.orders.all({ count: 1 })
    .then(response => {
        console.log('✅ Razorpay Connection Successful!');
        console.log('Orders found:', response.items ? response.items.length : 0);
    })
    .catch(error => {
        console.error('❌ Razorpay Connection Failed:', error.error ? error.error.description : error.message);
    });
