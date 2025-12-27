const fetch = require('node-fetch'); // might need to install or use native in node 18+

async function check() {
    try {
        const response = await fetch('https://strong-bats-type.loca.lt/api/organizers', {
            headers: { 'Bypass-Tunnel-Reminder': 'true' }
        });
        const text = await response.text();
        console.log("Status:", response.status);
        console.log("Response Preview:", text.substring(0, 500));
    } catch (e) {
        console.error(e);
    }
}
check();
