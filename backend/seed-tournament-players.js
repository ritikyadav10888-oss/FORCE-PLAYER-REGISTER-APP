const fetch = require('node-fetch');

const API = 'http://localhost:5000/api';
const ORG_EMAIL = 'anand123@gmail.com'; // Owner/Org
const PASS = '123456'; // Owner pass might be admin1? 'admin1' is in seed-owner.js

const req = async (method, path, body) => {
    const headers = { 'Content-Type': 'application/json' };
    try {
        const res = await fetch(`${API}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
        const text = await res.text();
        try {
            return { ok: res.ok, status: res.status, data: JSON.parse(text) };
        } catch {
            return { ok: res.ok, status: res.status, data: text };
        }
    } catch (e) {
        return { ok: false, status: 0, data: e };
    }
};

async function run() {
    try {
        console.log("=== POPULATING TOURNAMENT ===");

        // 1. Get All Tournaments
        const tRes = await req('GET', '/tournaments');
        if (!tRes.ok) throw new Error("Failed to fetch tournaments");

        let tournament = tRes.data.find(t => t.status === 'PENDING');
        if (!tournament) {
            console.log("No PENDING tournament found. Creating one...");
            // Need to login as Org first
            const loginRes = await req('POST', '/auth/login', { email: ORG_EMAIL, password: 'admin1' });
            if (!loginRes.ok) throw new Error("Login failed (admin1)");
            const orgId = loginRes.data._id;

            const createRes = await req('POST', '/tournaments', {
                name: "Demo Tournament " + Date.now(),
                gameType: "Tennis",
                date: "2025-01-01",
                time: "10:00",
                entryFee: 100,
                type: "SINGLE",
                organizerId: orgId
            });
            tournament = createRes.data;
            console.log("Created:", tournament.name);
        } else {
            console.log("Found Tournament:", tournament.name);
        }

        // 2. Create 4 Players & Join
        for (let i = 1; i <= 4; i++) {
            const pEmail = `demo_player_${i}_${Date.now()}@test.com`;
            const pPass = 'Pass@123';
            console.log(`Creating Player ${i}: ${pEmail}`);

            const regRes = await req('POST', '/auth/register', {
                name: `Demo Player ${i}`,
                email: pEmail,
                password: pPass,
                role: 'PLAYER',
                mobile: '900000000' + i
            });
            const pId = regRes.data._id;

            // Topup
            await req('POST', `/users/${pId}/topup`, { amount: 5000, paymentMethod: 'WALLET' });

            // Join
            const joinRes = await req('POST', `/tournaments/${tournament._id || tournament.id}/join`, { userId: pId });
            if (joinRes.ok) console.log(`   Joined.`);
            else console.log(`   Join Failed:`, joinRes.data);
        }

        // 3. Start Tournament (Switch to ONGOING and Generate Matches)
        console.log("Starting Tournament (Generating Matches)...");
        const startRes = await req('PUT', `/tournaments/${tournament._id || tournament.id}`, { status: 'ONGOING' });
        if (startRes.ok) {
            console.log("Tournament STARTED! Matches generated.");
            console.log("Matches:", startRes.data.matches.length);
        } else {
            console.error("Failed to start:", startRes.data);
        }

    } catch (e) {
        console.error("Error:", e.message);
    }
}

if (!globalThis.fetch) { try { globalThis.fetch = require('node-fetch'); } catch (e) { } }
run();
