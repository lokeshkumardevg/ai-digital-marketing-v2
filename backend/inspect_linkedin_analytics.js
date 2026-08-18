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
        'LinkedIn-Version': '202606',
      }
    });
    if (!adAccRes.ok) {
      console.log('Failed to fetch LinkedIn Ad Accounts:', await adAccRes.text());
      process.exit(0);
    }
    const adAccData = await adAccRes.json();
    const adAccount = adAccData.elements?.[0];
    if (adAccount) {
      const cleanId = String(adAccount.id).includes(':') ? String(adAccount.id).split(':').pop() : adAccount.id;
      console.log(`Account ID: ${cleanId}`);
      
      const analyticsUrl = `https://api.linkedin.com/rest/adAnalytics?q=analytics&pivot=CAMPAIGN&dateRange=(start:(year:2020,month:1,day:1))&timeGranularity=ALL&accounts=List(urn%3Ali%3AsponsoredAccount%3A${cleanId})&fields=costInLocalCurrency,impressions,clicks,pivotValues`;
      console.log(`Querying Campaign Analytics via Account: ${analyticsUrl}`);
      
      const statsRes = await fetch(analyticsUrl, {
        headers: {
          'Authorization': `Bearer ${user.linkedinAccessToken}`,
          'LinkedIn-Version': '202606',
          'X-Restli-Protocol-Version': '2.0.0',
        }
      });
      if (statsRes.ok) {
        console.log('Campaign Analytics via Account Stats:', await statsRes.json());
      } else {
        console.log('Failed Campaign Analytics via Account Stats:', await statsRes.text());
      }

      // Let's query campaigns list details again
      const targetUrl = `https://api.linkedin.com/rest/adAccounts/${cleanId}/adCampaigns?q=search`;
      const campRes = await fetch(targetUrl, {
        headers: {
          'Authorization': `Bearer ${user.linkedinAccessToken}`,
          'LinkedIn-Version': '202606',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      if (campRes.ok) {
        const campData = await campRes.json();
        console.log(`Found campaigns: ${campData.elements ? campData.elements.length : 0}`);
        for (const c of (campData.elements || []).slice(0, 5)) {
          console.log(`- Campaign: ${c.id}, Name: ${c.name}, Status: ${c.status}, Objective: ${c.objectiveType}`);
        }
      }
    }
  } catch (err) {
    console.error('Error querying LinkedIn API:', err.message);
  }
  process.exit(0);
}
run();
