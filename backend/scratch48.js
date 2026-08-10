const { MongoClient } = require('mongodb');
async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  
  const records = await db.collection('analytics').find({ workspaceId: '6a1d324b5291a9f8db25ff2b' }).toArray();
  console.log(`Analytics records count: ${records.length}`);
  for (const r of records) {
    console.log(`- Date: ${r.date}, Platform: ${r.platform}, Spend: ${r.spend}, Impressions: ${r.impressions}, Clicks: ${r.clicks}`);
  }
  process.exit(0);
}
run();
