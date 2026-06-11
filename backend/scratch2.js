const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config({ path: 'backend/.env' });

async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  
  const user = await db.collection('users').findOne({ googleAccessToken: { $exists: true, $ne: null } }, { sort: { _id: -1 } });
  
  const devToken = process.env.GOOGLE_DEVELOPER_TOKEN || 'lcZ3RRE00HWy2i4quLMNuQ';

  const res = await fetch('https://googleads.googleapis.com/v17/customers:listAccessibleCustomers', {
    headers: {
      'Authorization': `Bearer ${user.googleAccessToken}`,
      'developer-token': devToken || ''
    }
  });
  
  const text = await res.text();
  console.log('Status:', res.status);
  console.log(text);
  process.exit(0);
}
run();
