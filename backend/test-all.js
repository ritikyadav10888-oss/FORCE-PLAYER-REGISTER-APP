const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api';

async function testAll() {
    console.log('🧪 FORCE APP - COMPREHENSIVE TEST SUITE\n');
    console.log('='.repeat(60));

    let passed = 0;
    let failed = 0;

    // Test 1: Backend Server Health
    console.log('\n📡 TEST 1: Backend Server Health');
    try {
        const response = await fetch(`${API_URL}/tournaments`);
        if (response.ok) {
            console.log('✅ Backend server is running and responding');
            passed++;
        } else {
            console.log('❌ Backend server returned error:', response.status);
            failed++;
        }
    } catch (error) {
        console.log('❌ Cannot connect to backend:', error.message);
        failed++;
    }

    // Test 2: Login Functionality
    console.log('\n🔐 TEST 2: Login Functionality (Owner)');
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'anand123@gmail.com',
                password: 'admin1'
            })
        });
        const data = await response.json();
        if (response.ok && data.role === 'OWNER') {
            console.log('✅ Owner login successful');
            console.log(`   User: ${data.name} (${data.email})`);
            passed++;
        } else {
            console.log('❌ Login failed:', data.error || 'Unknown error');
            failed++;
        }
    } catch (error) {
        console.log('❌ Login test error:', error.message);
        failed++;
    }

    // Test 3: Tournaments Endpoint
    console.log('\n🏆 TEST 3: Tournaments Endpoint');
    try {
        const response = await fetch(`${API_URL}/tournaments`);
        const data = await response.json();
        console.log(`✅ Tournaments endpoint working`);
        console.log(`   Found ${data.length} tournament(s)`);
        passed++;
    } catch (error) {
        console.log('❌ Tournaments test error:', error.message);
        failed++;
    }

    // Test 4: Organizers Endpoint
    console.log('\n👥 TEST 4: Organizers Endpoint');
    try {
        const response = await fetch(`${API_URL}/organizers`);
        const data = await response.json();
        console.log(`✅ Organizers endpoint working`);
        console.log(`   Found ${data.length} organizer(s)`);
        passed++;
    } catch (error) {
        console.log('❌ Organizers test error:', error.message);
        failed++;
    }

    // Test 5: Players Endpoint
    console.log('\n🎮 TEST 5: Players Endpoint');
    try {
        const response = await fetch(`${API_URL}/players`);
        const data = await response.json();
        console.log(`✅ Players endpoint working`);
        console.log(`   Found ${data.length} player(s)`);
        passed++;
    } catch (error) {
        console.log('❌ Players test error:', error.message);
        failed++;
    }

    // Test 6: Leaderboard Endpoint
    console.log('\n🏅 TEST 6: Leaderboard Endpoint');
    try {
        const response = await fetch(`${API_URL}/leaderboard`);
        const data = await response.json();
        console.log(`✅ Leaderboard endpoint working`);
        console.log(`   Found ${data.length} player(s) in leaderboard`);
        passed++;
    } catch (error) {
        console.log('❌ Leaderboard test error:', error.message);
        failed++;
    }

    // Test 7: Database Connection
    console.log('\n💾 TEST 7: Database Connection');
    try {
        const response = await fetch(`${API_URL}/players`);
        const data = await response.json();
        if (Array.isArray(data)) {
            console.log('✅ MongoDB connection working');
            passed++;
        } else {
            console.log('❌ Unexpected data format from database');
            failed++;
        }
    } catch (error) {
        console.log('❌ Database test error:', error.message);
        failed++;
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

    if (failed === 0) {
        console.log('\n🎉 ALL TESTS PASSED! Application is working properly.');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the errors above.');
    }

    console.log('='.repeat(60));
}

testAll();
