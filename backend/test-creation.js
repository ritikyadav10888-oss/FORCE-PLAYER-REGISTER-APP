const fetch = require('node-fetch'); // Try require, if fails use global fetch

async function run() {
    try {
        // 1. Login
        console.log("Logging in...");
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'anand123@gmail.com', password: 'admin1' })
        });
        const userData = await loginRes.json();
        if (!loginRes.ok) throw new Error(userData.error || 'Login failed');
        console.log("Logged in:", userData.email, userData._id);

        // 2. Create Tournament (Valid)
        console.log("Creating Tournament (SINGLE)...");
        const tData = {
            name: "Test Auto Check",
            gameType: "Chess",
            date: "2025-12-30",
            time: "10:00",
            entryFee: 500,
            type: "SINGLE", // Uppercase
            organizerId: userData._id
        };

        const createRes = await fetch('http://localhost:5000/api/tournaments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tData)
        });

        const createData = await createRes.json();

        if (createRes.ok) {
            console.log("SUCCESS! Tournament Created:", createData._id, createData.type);
        } else {
            console.error("FAILURE! Error:", createData);
        }

    } catch (e) {
        console.error("Test Script Error:", e.message);
    }
}

// Check Global Fetch support
if (!globalThis.fetch) {
    try {
        globalThis.fetch = require('node-fetch');
    } catch (e) {
        console.error("No fetch available. Please install node-fetch or use Node 18+");
    }
}

run();
