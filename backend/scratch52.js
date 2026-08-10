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
    const res = await fetch('http://localhost:3000/analytics/sync/linkedin', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Sync Status:', res.status);
    console.log('Sync Response:', await res.text());
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}
run();
