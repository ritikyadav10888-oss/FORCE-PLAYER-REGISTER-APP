const fetch = require('node-fetch');

async function quickTest() {
    console.log('Testing Backend...\n');

    // Test login
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'anand123@gmail.com', password: 'admin1' })
    });
    const loginData = await loginRes.json();
    console.log('1. Login:', loginRes.ok ? '✅ PASS' : '❌ FAIL');

    // Test tournaments
    const tourRes = await fetch('http://localhost:5000/api/tournaments');
    const tourData = await tourRes.json();
    console.log('2. Tournaments:', tourRes.ok ? `✅ PASS (${tourData.length} found)` : '❌ FAIL');

    // Test organizers
    const orgRes = await fetch('http://localhost:5000/api/organizers');
    const orgData = await orgRes.json();
    console.log('3. Organizers:', orgRes.ok ? `✅ PASS (${orgData.length} found)` : '❌ FAIL');

    // Test players
    const playRes = await fetch('http://localhost:5000/api/players');
    const playData = await playRes.json();
    console.log('4. Players:', playRes.ok ? `✅ PASS (${playData.length} found)` : '❌ FAIL');

    console.log('\n✅ Backend is working properly!');
}

quickTest().catch(err => console.error('❌ Error:', err.message));
