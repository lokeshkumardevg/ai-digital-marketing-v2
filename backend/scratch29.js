const { MongoClient } = require('mongodb');
async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const user = await db.collection('users').findOne({ linkedinAccessToken: { $exists: true, $ne: null } });
  const token = user.linkedinAccessToken;
  
  const urls = [
    {
      name: "adAccountsV2 search no params",
      url: "https://api.linkedin.com/v2/adAccountsV2?q=search",
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Restli-Protocol-Version': '2.0.0',
      }
    },
    {
      name: "adAccountsV2 search count 5",
      url: "https://api.linkedin.com/v2/adAccountsV2?q=search&count=5",
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Restli-Protocol-Version': '2.0.0',
      }
    },
    {
      name: "adAccounts search no params",
      url: "https://api.linkedin.com/v2/adAccounts?q=search",
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    },
    {
      name: "adAccountsV2 search status & type",
      url: "https://api.linkedin.com/v2/adAccountsV2?q=search&search.type.values[0]=BUSINESS&search.status.values[0]=ACTIVE&count=10",
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    },
    {
      name: "v2/adAccounts?q=search with Restli headers",
      url: "https://api.linkedin.com/v2/adAccounts?q=search",
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    },
    {
      name: "rest/adAccounts (Versioned API)",
      url: "https://api.linkedin.com/rest/adAccounts?q=search",
      headers: {
        'Authorization': `Bearer ${token}`,
        'LinkedIn-Version': '202605',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    }
  ];

  for (const item of urls) {
    try {
      const res = await fetch(item.url, { headers: item.headers });
      const body = await res.text();
      console.log(`=== ${item.name} ===`);
      console.log('Status:', res.status);
      console.log('Body:', body.slice(0, 500));
    } catch (e) {
      console.error(`Error for ${item.name}:`, e.message);
    }
  }

  process.exit(0);
}
run();
