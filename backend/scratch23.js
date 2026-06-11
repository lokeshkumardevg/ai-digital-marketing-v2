const { MongoClient } = require('mongodb');
async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const user = await db.collection('users').findOne({ linkedinAccessToken: { $exists: true, $ne: null } });
  if (!user) return process.exit(0);
  const token = user.linkedinAccessToken;
  
  // Try fetching LinkedIn Ad Accounts
  const endpoints = [
    'https://api.linkedin.com/v2/adAccountsV2?q=search&search.type.values[0]=BUSINESS',
    'https://api.linkedin.com/v2/adAccounts?q=search',
    'https://api.linkedin.com/rest/adAccounts?q=search&search.type.values[0]=BUSINESS&search.status.values[0]=ACTIVE',
  ];
  
  for (const url of endpoints) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Restli-Protocol-Version': '2.0.0',
      }
    });
    const body = await res.text();
    console.log(`Status ${res.status} — ${url.split('?')[0].split('/').pop()}`);
    console.log(body.slice(0, 300));
    console.log('---');
  }
  process.exit(0);
}
run();
