const https = require('https');
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

  const options = {
    hostname: 'googleads.googleapis.com',
    port: 443,
    path: '/v16/customers:listAccessibleCustomers',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${user.googleAccessToken}`,
      'developer-token': devToken,
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log(data);
      process.exit(0);
    });
  });

  req.on('error', (e) => {
    console.error(e);
    process.exit(1);
  });
  req.end();
}
run();
