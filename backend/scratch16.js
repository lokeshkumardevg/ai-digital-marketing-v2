const { MongoClient } = require('mongodb');
async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  // Check Twitter user - fetch real username using Twitter API v2
  const user = await db.collection('users').findOne({ twitterAccessToken: { $exists: true, $ne: null } });
  if (user) {
    console.log('twitterUserId:', user.twitterUserId);
    const res = await fetch(`https://api.twitter.com/2/users/${user.twitterUserId}?user.fields=username,name,profile_image_url`, {
      headers: { Authorization: `Bearer ${user.twitterAccessToken}` }
    });
    const data = await res.json();
    console.log('Twitter API status:', res.status);
    console.log('Twitter data:', JSON.stringify(data, null, 2));
  }

  // Check LinkedIn account
  const liUser = await db.collection('users').findOne({ linkedinAccessToken: { $exists: true, $ne: null } });
  if (liUser) {
    const res2 = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${liUser.linkedinAccessToken}` }
    });
    const data2 = await res2.json();
    console.log('LinkedIn userinfo status:', res2.status);
    console.log('LinkedIn data:', JSON.stringify(data2, null, 2));
  }

  const liAcc = await db.collection('linkedinaccounts').findOne({});
  if (liAcc) {
    console.log('LinkedIn account fields:', JSON.stringify({ profileName: liAcc.profileName, email: liAcc.email, connectedOrganizationUrn: liAcc.connectedOrganizationUrn, connectedOrganizationName: liAcc.connectedOrganizationName }, null, 2));
  }

  process.exit(0);
}
run();
