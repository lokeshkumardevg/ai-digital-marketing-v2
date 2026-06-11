const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config({ path: 'backend/.env' });

async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  
  // get latest user with google access token
  const user = await db.collection('users').findOne({ googleAccessToken: { $exists: true, $ne: null } }, { sort: { _id: -1 } });
  
  if (!user) {
    console.log('No user found');
    process.exit(0);
  }

  const devToken = process.env.GOOGLE_DEVELOPER_TOKEN || 'lcZ3RRE00HWy2i4quLMNuQ';
  console.log('User email:', user.email);

  const res = await fetch('https://googleads.googleapis.com/v16/customers:listAccessibleCustomers', {
    headers: {
      'Authorization': `Bearer ${user.googleAccessToken}`,
      'developer-token': devToken || ''
    }
  });
  
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
  process.exit(0);
}
run();
