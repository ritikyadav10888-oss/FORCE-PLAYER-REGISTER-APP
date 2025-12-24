const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';

const testRegistration = async () => {
    const uniqueId = Date.now();
    const userData = {
        name: `Test User ${uniqueId}`,
        email: `test${uniqueId}@example.com`,
        password: 'Password@123',
        role: 'PLAYER',
        mobile: '1234567890',
        address: 'Test Address',
        aadharNumber: '123412341234',
        game: 'Badminton',
        strength: 'Beginner',
        gameType: 'Single'
    };

    console.log(`\n--- Testing Registration for ${userData.email} ---`);
    try {
        const response = await axios.post(`${API_URL}/register`, userData);

        if (response.data.token) {
            console.log('✅ Registration Successful!');
            console.log('✅ Token received immediately (No OTP required).');
            return true;
        } else if (response.data.requireVerification) {
            console.error('❌ Failed: Server still asks for verification.');
            return false;
        } else {
            console.log('⚠️ Unexpected response:', response.data);
            return false;
        }
    } catch (error) {
        console.error('❌ Registration Error:', error.response ? error.response.data : error.message);
        return false;
    }
};

const run = async () => {
    const success = await testRegistration();
    if (success) {
        console.log('\n✅ VERIFICATION COMPLETE: The backend is correctly configured to skip email verification.');
    } else {
        console.log('\n❌ VERIFICATION FAILED: Please check the server logs.');
    }
};

run();
