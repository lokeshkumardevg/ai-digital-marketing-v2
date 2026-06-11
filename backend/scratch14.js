const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config({ path: 'backend/.env' });

async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const dbClient = new MongoClient(uri);
  await dbClient.connect();
  const db = dbClient.db();
  
  const user = await db.collection('users').findOne({ linkedinAccessToken: { $exists: true, $ne: null } });
  if (!user) { console.log('No user with linkedinAccessToken'); return process.exit(0); }

  console.log('Got user:', user._id);
  const res = await fetch('https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee', {
    headers: { Authorization: `Bearer ${user.linkedinAccessToken}` },
  });
  
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Data:', JSON.stringify(data, null, 2));

  process.exit(0);
}
run();
