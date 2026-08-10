const { MongoClient } = require('mongodb');
async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  
  const users = await db.collection('users').find({}).toArray();
  console.log(`Total users: ${users.length}`);
  for (const u of users) {
    console.log(`- ID: ${u._id.toString()}, Email: ${u.email}, Name: ${u.name}, Currency: ${u.currency}`);
    console.log(`  LinkedIn Token Present: ${u.linkedinAccessToken ? 'Yes' : 'No'}`);
  }
  process.exit(0);
}
run();
