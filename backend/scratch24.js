// Try the REST API with proper version header
const { MongoClient } = require('mongodb');
async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const user = await db.collection('users').findOne({ linkedinAccessToken: { $exists: true, $ne: null } });
  const token = user.linkedinAccessToken;
  
  const res = await fetch('https://api.linkedin.com/rest/adAccounts?q=search&search.type.values[0]=BUSINESS&search.status.values[0]=ACTIVE', {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Restli-Protocol-Version': '2.0.0',
      'LinkedIn-Version': '202307',
    }
  });
  const body = await res.text();
  console.log('Status:', res.status);
  console.log('Body:', body.slice(0, 500));
  process.exit(0);
}
run();
