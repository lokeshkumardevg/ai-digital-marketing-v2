const { MongoClient, ObjectId } = require('mongodb');
async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  
  const user = await db.collection('users').findOne({ _id: new ObjectId('6a1d324b5291a9f8db25ff2b') });
  console.log('User:', user.email);
  console.log('User UpdatedAt:', user.updatedAt || user.updated_at);
  
  const campaigns = await db.collection('campaigns').find({ userId: '6a1d324b5291a9f8db25ff2b' }).toArray();
  console.log('Campaigns Count:', campaigns.length);
  for (const c of campaigns) {
    console.log(`- Campaign: ${c.name}, Platform: ${c.platform}, isReal: ${c.isReal || c.isRealLinkedIn}`);
  }
  process.exit(0);
}
run();
