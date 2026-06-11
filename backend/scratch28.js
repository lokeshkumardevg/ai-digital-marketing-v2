const { MongoClient } = require('mongodb');
async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const users = await db.collection('users').find({ linkedinAccessToken: { $exists: true, $ne: null } }).toArray();
  
  console.log(`Found ${users.length} users with LinkedIn tokens`);
  
  for (const user of users) {
    const meRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${user.linkedinAccessToken}` }
    });
    console.log(`User ${user.email} (ID: ${user._id}) Token Valid:`, meRes.status === 200, meRes.status);
    if (meRes.status === 200) {
        const body = await meRes.text();
        console.log(`  Body: ${body.slice(0, 100)}`);
    }
  }
  
  process.exit(0);
}
run();
