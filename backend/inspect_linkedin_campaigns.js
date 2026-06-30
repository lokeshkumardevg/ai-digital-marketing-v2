const { MongoClient } = require('mongodb');

async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  
  const user = await db.collection('users').findOne({ email: 'wheedletechnologis@gmail.com' });
  if (!user || !user.linkedinAccessToken) {
    console.log('No user with linkedin token found');
    process.exit(0);
  }

  console.log(`Using linkedinAccessToken: ${user.linkedinAccessToken.slice(0, 20)}...`);
  try {
    const adAccRes = await fetch('https://api.linkedin.com/v2/adAccountsV2?q=search&count=5', {
      headers: {
        'Authorization': `Bearer ${user.linkedinAccessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202605',
      }
    });
    if (!adAccRes.ok) {
      console.log('Failed to fetch LinkedIn Ad Accounts:', await adAccRes.text());
      process.exit(0);
    }
    const adAccData = await adAccRes.json();
    const adAccount = adAccData.elements?.[0];
    if (adAccount) {
      console.log(`Querying campaigns for Ad Account ${adAccount.id}...`);
      const targetUrl = `https://api.linkedin.com/rest/adCampaigns?q=search&search=(account:(values:List(urn%3Ali%3AsponsoredAccount%3A${adAccount.id})))`;
      const campRes = await fetch(targetUrl, {
        headers: {
          'Authorization': `Bearer ${user.linkedinAccessToken}`,
          'LinkedIn-Version': '202605',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      if (campRes.ok) {
        const campData = await campRes.json();
        console.log('LinkedIn Campaigns:');
        console.log(JSON.stringify(campData, null, 2));
      } else {
        console.log('Failed to fetch LinkedIn Campaigns:', await campRes.text());
      }
    }
  } catch (err) {
    console.error('Error querying LinkedIn API:', err.message);
  }
  process.exit(0);
}
run();
