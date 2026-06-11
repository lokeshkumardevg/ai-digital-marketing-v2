const { MongoClient } = require('mongodb');
async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const user = await db.collection('users').findOne({ twitterAccessToken: { $exists: true, $ne: null } });
  
  if (!user) return process.exit(0);
  
  const token = user.twitterAccessToken;
  
  const res = await fetch('https://ads-api.twitter.com/11/accounts', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Body:', text.slice(0, 500));
  
  process.exit(0);
}
run();
