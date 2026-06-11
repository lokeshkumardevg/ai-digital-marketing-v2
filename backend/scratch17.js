// Try using the client credentials (app-only bearer token) to lookup the user by ID
async function run() {
  const clientId = 'c0t2ZDJJWllmZFBkSmxIcmFRX3M6MTpjaQ';
  const clientSecret = 'nx8ilchTpK_Q5QzapNA53QiQXAX4yAHDve3M_uIpxPAsMkufkR';
  
  // Get app-only bearer token
  const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const tokenRes = await fetch('https://api.twitter.com/oauth2/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials'
  });
  const tokenData = await tokenRes.json();
  console.log('Token status:', tokenRes.status, JSON.stringify(tokenData));

  if (tokenData.access_token) {
    const userId = '2012447571302817792';
    const userRes = await fetch(`https://api.twitter.com/2/users/${userId}?user.fields=username,name,profile_image_url`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();
    console.log('Twitter user status:', userRes.status);
    console.log('Twitter user:', JSON.stringify(userData, null, 2));
  }
}
run();
