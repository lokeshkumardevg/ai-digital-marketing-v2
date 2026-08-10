const { MongoClient } = require('mongodb');
async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  
  const users = await db.collection('users').find({ linkedinAccessToken: { $exists: true, $ne: null } }).toArray();
  console.log(`Found ${users.length} users with LinkedIn tokens:`);
  for (const u of users) {
    console.log(`- ID: ${u._id}, Email: ${u.email}, Name: ${u.name}, Token length: ${u.linkedinAccessToken?.length}`);
  }
  process.exit(0);
}
run();
