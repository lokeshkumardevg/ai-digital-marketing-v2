const { MongoClient } = require('mongodb');
async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const user = await db.collection('users').findOne({ twitterAccessToken: { $exists: true, $ne: null } });
  if (!user) return (console.log('No X user found'), process.exit(0));
  const keys = Object.keys(user).filter(k => k.toLowerCase().includes('twitter') || k.toLowerCase().includes('x_'));
  console.log('Twitter fields:', keys.map(k => `${k}: ${user[k]}`));
  process.exit(0);
}
run();
