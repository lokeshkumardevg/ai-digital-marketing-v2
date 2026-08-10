const { MongoClient } = require('mongodb');
async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  
  const sessions = await db.collection('sessions').find({}).sort({ updatedAt: -1 }).limit(10).toArray();
  console.log(`Sessions count: ${sessions.length}`);
  for (const s of sessions) {
    console.log(`Session ID: ${s._id}, User: ${s.userId || s.user}, UpdatedAt: ${s.updatedAt || s.updated_at}`);
  }
  process.exit(0);
}
run();
