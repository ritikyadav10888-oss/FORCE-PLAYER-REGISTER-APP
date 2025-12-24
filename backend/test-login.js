const fetch = require('node-fetch');

async function testLogin() {
    try {
        console.log('Testing login endpoint...');

        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'anand123@gmail.com',
                password: 'admin1'
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ LOGIN SUCCESSFUL!');
            console.log('User:', data.name);
            console.log('Role:', data.role);
            console.log('Email:', data.email);
        } else {
            console.log('❌ LOGIN FAILED!');
            console.log('Error:', data.error);
            console.log('Status:', response.status);
        }
    } catch (error) {
        console.log('❌ CONNECTION ERROR!');
        console.log('Error:', error.message);
        console.log('\nPossible issues:');
        console.log('1. Backend server is not running');
        console.log('2. MongoDB is not running');
        console.log('3. Wrong port number');
    }
}

testLogin();
