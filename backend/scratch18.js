const { MongoClient } = require('mongodb');
async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  // Check user document
  const user = await db.collection('users').findOne({ twitterAccessToken: { $exists: true, $ne: null } });
  if (user) {
    console.log('twitterUserId stored:', user.twitterUserId);
    // Try user access token to get their info
    const res = await fetch('https://api.twitter.com/2/users/me?user.fields=username,name,profile_image_url', {
      headers: { Authorization: `Bearer ${user.twitterAccessToken}` }
    });
    const data = await res.json();
    console.log('Twitter /me status:', res.status, JSON.stringify(data));
    
    // Try refreshing the token if refresh token exists
    if (user.twitterRefreshToken) {
      console.log('Has refresh token, token length:', user.twitterAccessToken?.length);
    }
  }

  // Check LinkedIn user token
  const liUser = await db.collection('users').findOne({ linkedinAccessToken: { $exists: true, $ne: null } });
  if (liUser) {
    console.log('LinkedIn user token length:', liUser.linkedinAccessToken?.length);
    // Fetch profile
    const res = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${liUser.linkedinAccessToken}` }
    });
    const data = await res.json();
    console.log('LinkedIn /userinfo status:', res.status, JSON.stringify(data));
    console.log('LinkedIn stored name:', liUser.name, liUser.email);
  }

  process.exit(0);
}
run();
