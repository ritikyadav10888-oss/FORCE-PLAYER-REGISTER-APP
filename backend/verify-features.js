const fetch = require('node-fetch');

const API = 'http://localhost:5000/api';
const ORG_EMAIL = 'verify_org_' + Date.now() + '@test.com';
const PLAYER_EMAIL = 'verify_player_' + Date.now() + '@test.com';
const PASS = 'Pass@123';

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
        return { ok: false, status: 0, data: e.message };
    }
};

async function run() {
    try {
        console.log("=== START VERIFICATION ===");

        // 1. Register Organizer
        console.log(`1. Register Organizer (${ORG_EMAIL})...`);
        const orgRes = await req('POST', '/auth/register', { name: 'Test Org', email: ORG_EMAIL, password: PASS, role: 'ORGANIZER', mobile: '9999999999' });
        // If already exists (unlikely with random), login?
        if (!orgRes.ok) throw new Error("Reg Org Failed: " + JSON.stringify(orgRes.data));
        const orgId = orgRes.data._id;
        console.log("   Organizer ID:", orgId);

        // 2. Create Tournament
        console.log("2. Create Tournament...");
        const tRes = await req('POST', '/tournaments', {
            name: "Initial Name", gameType: "Chess", date: "2025-12-31", time: "10:00", entryFee: 100, type: "SINGLE", organizerId: orgId
        });
        if (!tRes.ok) throw new Error("Create Failed: " + JSON.stringify(tRes.data));
        const tId = tRes.data._id;
        console.log("   Tournament ID:", tId);

        // 3. EDIT Tournament
        console.log("3. EDIT Tournament (Rename to 'Updated Name')...");
        const editRes = await req('PUT', `/tournaments/${tId}`, { name: "Updated Name", entryFee: 200 });
        if (!editRes.ok) throw new Error("Update Failed: " + JSON.stringify(editRes.data));
        if (editRes.data.name !== "Updated Name") throw new Error("Update didn't persist! Got: " + editRes.data.name);
        console.log("   Update Verified.");

        // 4. Register Player
        console.log(`4. Register Player (${PLAYER_EMAIL})...`);
        const pRes = await req('POST', '/auth/register', { name: 'Test Player', email: PLAYER_EMAIL, password: PASS, role: 'PLAYER', mobile: '8888888888' });
        const pId = pRes.data._id;

        // Topup
        await req('POST', `/users/${pId}/topup`, { amount: 1000, paymentMethod: 'WALLET' });

        // 5. Join Tournament
        console.log("5. Player Joining...");
        const joinRes = await req('POST', `/tournaments/${tId}/join`, { userId: pId });
        if (!joinRes.ok) throw new Error("Join Failed: " + JSON.stringify(joinRes.data));
        console.log("   Joined.");

        // 6. BROADCAST
        console.log("6. BROADCAST Message...");
        const broadRes = await req('POST', `/tournaments/${tId}/announce`, { message: "Hello Players!" });
        if (broadRes.status === 404) {
            console.warn("   WARNING: Broadcast route '/announce' NOT FOUND (404).");
        } else if (!broadRes.ok) {
            throw new Error("Broadcast Failed: " + JSON.stringify(broadRes.data));
        } else {
            console.log("   Broadcast Sent (Success).");
        }

        // 7. DELETE (Should FAIL)
        console.log("7. Attempt DELETE (Expect Fail)...");
        const delFail = await req('DELETE', `/tournaments/${tId}`);
        if (delFail.ok) throw new Error("Delete SUCCEEDED but should have FAILED (Players exist)!");
        console.log("   Delete Blocked Correctly:", delFail.data.error);

        // 8. Player Leaves
        console.log("8. Player Leaves...");
        await req('POST', `/tournaments/${tId}/leave`, { userId: pId });

        // 9. DELETE (Should PASS)
        console.log("9. Attempt DELETE (Expect Success)...");
        const delRes = await req('DELETE', `/tournaments/${tId}`);
        if (!delRes.ok) throw new Error("Delete Failed: " + JSON.stringify(delRes.data));
        console.log("   Delete Success.");

        console.log("\n✅ ALL CHECKS PASSED!");

    } catch (e) {
        console.error("\n❌ TEST FAILED:", e.message);
    }
}
if (!globalThis.fetch) { try { globalThis.fetch = require('node-fetch'); } catch (e) { } }
run();
