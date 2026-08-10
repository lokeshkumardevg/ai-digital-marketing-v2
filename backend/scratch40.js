const { MongoClient } = require('mongodb');
async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  
  const campaigns = await db.collection('campaigns').find({}).toArray();
  console.log(`Total campaigns in DB: ${campaigns.length}`);
  for (const c of campaigns) {
    console.log(`- ID: ${c._id}, Name: ${c.name}, Platform: ${c.platform}, UserID: ${c.userId}, isReal: ${c.isReal || c.isRealLinkedIn}`);
  }
  process.exit(0);
}
run();
