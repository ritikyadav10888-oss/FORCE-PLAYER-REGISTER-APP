const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const EMAIL = 'testplayer@gmail.com';
const PASSWORD = 'Player@123';

async function testPlayerFlow() {
    console.log('🚀 Starting Test Flow for:', EMAIL);

    try {
        // 1. Login
        console.log('\n1️⃣  Attempting Login...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: EMAIL,
            password: PASSWORD
        });

        const token = loginRes.data.token;
        const user = loginRes.data; // User data is at root level
        console.log('✅ Login Successful!');

        // MongoDB uses _id, let's map it for convenience if needed, but user._id should act as id
        const userId = user._id || user.id;

        console.log(`   User ID: ${userId}`);
        console.log(`   Role: ${user.role}`);

        if (user.role.toLowerCase() !== 'player') {
            console.error(`❌ Error: User is not a player! (Role: ${user.role})`);
            return;
        }

        // 2. Fetch Tournaments
        console.log('\n2️⃣  Fetching Tournaments...');
        const tourneysRes = await axios.get(`${API_URL}/tournaments`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const tournaments = tourneysRes.data;
        console.log(`✅ Found ${tournaments.length} tournaments`);

        if (tournaments.length === 0) {
            console.log('⚠️  No tournaments found to test joining.');
            return;
        }

        // Find a pending tournament to join
        const tournament = tournaments.find(t => t.status === 'PENDING');
        if (!tournament) {
            console.log('⚠️  No PENDING tournaments found.');
            return;
        }

        console.log(`   Selected Tournament: "${tournament.name}" (ID: ${tournament._id})`);
        console.log(`   Entry Fee: ₹${tournament.entryFee}`);

        // 3. Create Payment Order
        console.log('\n3️⃣  Creating Payment Order...');
        const orderRes = await axios.post(`${API_URL}/payments/create-tournament-order`, {
            tournamentId: tournament._id,
            userId: userId
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const order = orderRes.data;
        console.log('✅ Order Created Successfully!');
        console.log(`   Order ID: ${order.id}`);
        console.log(`   Amount: ${order.amount} (₹${order.amount / 100})`);
        console.log(`   Currency: ${order.currency}`);

        console.log('\n🎉 TEST COMPLETED: Backend is fully functional for this player!');

    } catch (error) {
        console.error('\n❌ TEST FAILED');
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        } else {
            console.error('   Error:', error.message);
        }
    }
}

testPlayerFlow();
