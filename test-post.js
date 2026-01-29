const fetch = require('node-fetch');

async function testPost() {
    console.log('--- TESTING POST /api/room-types ---');
    try {
        const res = await fetch('http://localhost:3000/api/room-types', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Test Room " + Date.now(),
                basePrice: 1234567
            })
        });

        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Data:', data);
    } catch (err) {
        console.error('Fetch Error:', err.message);
    }
    console.log('------------------------------------');
}

testPost();
