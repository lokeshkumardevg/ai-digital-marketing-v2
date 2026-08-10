const jwt = require('jsonwebtoken');
async function run() {
  // Sign a JWT token for the user ID: 6a1d324b5291a9f8db25ff2b
  const tokenPayload = {
    id: '6a1d324b5291a9f8db25ff2b',
    sub: '6a1d324b5291a9f8db25ff2b',
    email: 'wheedletechnologis@gmail.com',
  };
  // Using default secret key from configuration/JWT service (often 'jwtsecret' or similar in NestJS configs)
  // Let's inspect backend/.env or backend config to verify the jwt secret.
  const jwtSecret = 'supersecret_fallback_key_2026';
  
  const token = jwt.sign(tokenPayload, jwtSecret);
  
  try {
    const res = await fetch('http://localhost:3000/analytics/insights?platform=linkedin', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('API Status:', res.status);
    console.log('API Response:', await res.text());
  } catch (err) {
    console.error('Error calling local API:', err.message);
  }
  process.exit(0);
}
run();
