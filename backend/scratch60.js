const { MongoClient, ObjectId } = require('mongodb');

async function main() {
  const client = await MongoClient.connect('mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital');
  const db = client.db('ai_digital');
  
  // Find all users
  const users = await db.collection('users').find({}).toArray();
  console.log('Found users:');
  for (const u of users) {
    console.log(`- ID: ${u._id}, Email: ${u.email}, LinkedIn Token Present: ${!!u.linkedinAccessToken}`);
  }

  // Find all analytics records
  const records = await db.collection('analytics').find({}).toArray();
  console.log(`\nFound ${records.length} analytics records:`);
  for (const r of records.slice(-15)) {
    console.log(`- Platform: ${r.platform}, Date: ${r.date}, Spend: ${r.spend}, Impressions: ${r.impressions}, Clicks: ${r.clicks}`);
  }

  await client.close();
}

main().catch(console.error);
