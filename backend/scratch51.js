const jwt = require('jsonwebtoken');
async function run() {
  const tokenPayload = {
    id: '6a1d324b5291a9f8db25ff2b',
    sub: '6a1d324b5291a9f8db25ff2b',
    email: 'wheedletechnologis@gmail.com',
  };
  const jwtSecret = 'supersecret_fallback_key_2026';
  const token = jwt.sign(tokenPayload, jwtSecret);
  
  try {
    const res = await fetch('http://localhost:3000/campaign/user/6a1d324b5291a9f8db25ff2b', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Total items in response:', data.length);
    const realItems = data.filter(c => c.isReal);
    console.log('Real items count:', realItems.length);
    console.log('Real items details:', JSON.stringify(realItems.map(c => ({
      name: c.name,
      platform: c.platform,
      isReal: c.isReal,
      isRealLinkedIn: c.isRealLinkedIn,
      spend: c.spend,
      impressions: c.impressions
    })), null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}
run();
