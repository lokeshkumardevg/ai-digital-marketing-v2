const { MongoClient } = require('mongodb');
async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  // Try to fetch Twitter /me with the refresh token flow - first check if we can refresh
  const user = await db.collection('users').findOne({ twitterAccessToken: { $exists: true, $ne: null } });
  if (user && user.twitterRefreshToken) {
    const clientId = 'c0t2ZDJJWllmZFBkSmxIcmFRX3M6MTpjaQ';
    const clientSecret = 'nx8ilchTpK_Q5QzapNA53QiQXAX4yAHDve3M_uIpxPAsMkufkR';
    
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: user.twitterRefreshToken,
      client_id: clientId,
    });
    
    const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: body.toString()
    });
    const tokenData = await tokenRes.json();
    console.log('Refresh status:', tokenRes.status, JSON.stringify(tokenData));
    
    if (tokenData.access_token) {
      // Try fetching user info with new token
      const meRes = await fetch('https://api.twitter.com/2/users/me?user.fields=username,name,profile_image_url', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      const meData = await meRes.json();
      console.log('Twitter /me after refresh:', meRes.status, JSON.stringify(meData));
    }
  }
  process.exit(0);
}
run();
