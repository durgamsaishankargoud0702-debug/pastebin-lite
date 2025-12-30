/**
 * test-script.js
 * 
 * Usage: 
 * 1. Ensure server is running (npm run dev)
 * 2. Ensure TEST_MODE=1 in .env.local
 * 3. Run: node test-script.js
 */

const BASE_URL = 'http://localhost:3000';

async function testPastebin() {
    console.log('🚀 Starting Pastebin-Lite Tests...\n');

    // Helper: Create Paste
    async function createPaste(data) {
        const res = await fetch(`${BASE_URL}/api/pastes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const text = await res.text();
            console.error('❌ API Error:', res.status, text.substring(0, 500));
            // Try parsing JSON if possible, else return error obj
            try { return JSON.parse(text); } catch { return { error: text }; }
        }
        return res.json();
    }

    // Helper: Get Paste
    async function getPaste(id, headers = {}) {
        const res = await fetch(`${BASE_URL}/api/pastes/${id}`, { headers });
        return { status: res.status, body: await res.json() };
    }

    // --- TEST 1: Basic Creation & Retrieval ---
    console.log('Test 1: Basic Create & Read');
    const p1 = await createPaste({ content: 'Test Content 1' });
    if (!p1.id) throw new Error('Failed to create paste');
    console.log('  ✅ Created:', p1.id);

    const r1 = await getPaste(p1.id);
    if (r1.status !== 200 || r1.body.content !== 'Test Content 1') {
        console.error('❌ Mismatch:', r1.status, JSON.stringify(r1.body));
        throw new Error('Failed to fetch paste content');
    }
    console.log('  ✅ Retrieved Content Match');


    // --- TEST 2: View Limits ---
    console.log('\nTest 2: View Limits (Max 2 views)');
    const p2 = await createPaste({ content: 'Limited View', max_views: 2 });
    console.log('  ✅ Created:', p2.id);

    const v1 = await getPaste(p2.id); // View 1
    console.log(`  View 1 status: ${v1.status}`);

    const v2 = await getPaste(p2.id); // View 2
    console.log(`  View 2 status: ${v2.status}`);

    const v3 = await getPaste(p2.id); // View 3 (Should fail)
    if (v3.status === 404) {
        console.log('  ✅ View 3 correctly returned 404');
    } else {
        console.error('  ❌ View 3 should be 404, got', v3.status);
    }


    // --- TEST 3: Time Expiry (TTL) ---
    console.log('\nTest 3: Time Expiry (TTL 5s)');
    const p3 = await createPaste({ content: 'Time Test', ttl_seconds: 5 });
    console.log('  ✅ Created:', p3.id);

    // Save creation time
    // We assume the server time is close to Date.now()
    const now = Date.now();

    // Immediate read
    const t1 = await getPaste(p3.id);
    if (t1.status === 200) console.log('  ✅ Immediate read success');

    // Future read (Server time + 10s)
    const futureHeader = { 'x-test-now-ms': (now + 10000).toString() };
    const t2 = await getPaste(p3.id, futureHeader);

    if (t2.status === 404) {
        console.log('  ✅ Future read (simulated +10s) correctly returned 404');
    } else {
        // Note: This requires TEST_MODE=1 on server
        console.warn('  ⚠️ Future read was not 404. Ensure TEST_MODE=1 is set on server.');
    }

    console.log('\n✅ All Tests Completed');
}

testPastebin().catch(err => console.error('❌ Test Failed:', err));
