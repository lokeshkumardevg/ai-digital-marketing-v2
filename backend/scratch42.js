const { MongoClient, ObjectId } = require('mongodb');
async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  
  const user = await db.collection('users').findOne({ _id: new ObjectId('6a43618e8bb1ddd78386a159') });
  if (user) {
    console.log('User:', user.email, 'Name:', user.name);
    console.log('LinkedIn Token Present:', user.linkedinAccessToken ? 'Yes' : 'No');
    console.log('Token snippet:', user.linkedinAccessToken ? user.linkedinAccessToken.substring(0, 30) + '...' : 'N/A');
    console.log('linkedinPersonUrn:', user.linkedinPersonUrn);
    
    if (user.linkedinAccessToken) {
      // 1. Get Ad Accounts
      const accountsRes = await fetch('https://api.linkedin.com/v2/adAccountsV2?q=search&count=10', {
        headers: {
          Authorization: `Bearer ${user.linkedinAccessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      });
      console.log('adAccountsV2 response status:', accountsRes.status);
      if (accountsRes.status === 200) {
        const accountsData = await accountsRes.json();
        console.log('Ad Accounts:', JSON.stringify(accountsData.elements || [], null, 2));
      } else {
        console.log('adAccountsV2 Error:', await accountsRes.text());
      }
    }
  } else {
    console.log('User not found.');
  }
  process.exit(0);
}
run();
