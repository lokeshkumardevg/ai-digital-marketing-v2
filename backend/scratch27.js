const { MongoClient } = require('mongodb');
async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const user = await db.collection('users').findOne({ linkedinAccessToken: { $exists: true, $ne: null } });
  
  if (!user) return process.exit(0);
  const token = user.linkedinAccessToken;
  
  // 1. Check user info (is token valid?)
  const meRes = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Token Valid:', meRes.status === 200, meRes.status);

  // 2. Try fetching LinkedIn Ad Accounts
  const res = await fetch(
    'https://api.linkedin.com/v2/adAccountsV2?q=search&search.type.values[0]=BUSINESS&search.status.values[0]=ACTIVE&count=50',
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Restli-Protocol-Version': '2.0.0',
      }
    }
  );
  const text = await res.text();
  console.log('AdAccounts Status:', res.status);
  console.log('AdAccounts Body:', text.slice(0, 500));
  
  process.exit(0);
}
run();
