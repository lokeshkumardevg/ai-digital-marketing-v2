const { MongoClient } = require('mongodb');
async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  
  const users = await db.collection('users').find({ linkedinAccessToken: { $exists: true, $ne: null } }).toArray();
  for (const u of users) {
    console.log(`\n=== Testing for ${u.email} (ID: ${u._id}) ===`);
    try {
      const res = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${u.linkedinAccessToken}` }
      });
      console.log('userinfo Status:', res.status);
      if (res.status === 200) {
        const info = await res.json();
        console.log('Name:', info.name, 'Sub:', info.sub);
        
        // Try getting ad accounts
        const accountsRes = await fetch('https://api.linkedin.com/v2/adAccountsV2?q=search&count=10', {
          headers: {
            Authorization: `Bearer ${u.linkedinAccessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
          },
        });
        console.log('adAccountsV2 Status:', accountsRes.status);
        if (accountsRes.status === 200) {
          const accountsData = await accountsRes.json();
          console.log('Ad Accounts:', JSON.stringify(accountsData.elements || [], null, 2));
        } else {
          console.log('adAccountsV2 Error:', await accountsRes.text());
        }
      } else {
        console.log('userinfo Error:', await res.text());
      }
    } catch (e) {
      console.log('Error:', e.message);
    }
  }
  process.exit(0);
}
run();
