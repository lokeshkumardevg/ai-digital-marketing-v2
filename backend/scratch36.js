const { MongoClient } = require('mongodb');
async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  
  const user = await db.collection('users').findOne({ email: 'wheedletechnologis@gmail.com' });
  const token = user.linkedinAccessToken;
  console.log(`Using user: ${user.email}`);

  try {
    // 1. Get Ad Accounts
    const accountsRes = await fetch('https://api.linkedin.com/v2/adAccountsV2?q=search&count=10', {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });
    if (!accountsRes.ok) {
      console.log('Failed to fetch ad accounts:', await accountsRes.text());
      process.exit(0);
    }
    const accountsData = await accountsRes.json();
    const accountId = accountsData.elements?.[0]?.id;
    console.log('Found account ID:', accountId);
    if (!accountId) {
      console.log('No ad account found.');
      process.exit(0);
    }

    // 2. Get Campaigns
    const targetUrl = `https://api.linkedin.com/rest/adAccounts/${accountId}/adCampaigns?q=search`;
    console.log('Fetching campaigns from:', targetUrl);
    const campRes = await fetch(targetUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'LinkedIn-Version': '202606',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });
    if (!campRes.ok) {
      console.log('Failed to fetch campaigns:', await campRes.text());
      process.exit(0);
    }
    const campData = await campRes.json();
    console.log('Campaigns:', JSON.stringify(campData, null, 2));

    const campaignsList = campData.elements || [];
    const campaignUrns = campaignsList.map((c) => `urn:li:sponsoredCampaign:${c.id}`);
    console.log('Campaign URNs:', campaignUrns);

    if (campaignUrns.length > 0) {
      const campaignsParam = campaignUrns.map(urn => encodeURIComponent(urn)).join(',');
      const analyticsUrl = `https://api.linkedin.com/rest/adAnalytics?q=analytics&pivot=CAMPAIGN&dateRange=(start:(year:2026,month:1,day:1))&timeGranularity=ALL&campaigns=List(${campaignsParam})&fields=costInLocalCurrency,impressions,clicks`;
      console.log('Fetching analytics from:', analyticsUrl);
      const analyticsRes = await fetch(analyticsUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'LinkedIn-Version': '202606',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      console.log('Analytics Status:', analyticsRes.status);
      console.log('Analytics Body:', await analyticsRes.text());
    } else {
      console.log('No campaigns to query analytics for.');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}
run();
