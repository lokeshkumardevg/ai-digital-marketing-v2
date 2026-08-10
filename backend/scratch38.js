const { MongoClient } = require('mongodb');
async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  
  const user = await db.collection('users').findOne({ email: 'wheedletechnologis@gmail.com' });
  const token = user.linkedinAccessToken;

  try {
    const accountId = 540750450;
    const targetUrl = `https://api.linkedin.com/rest/adAccounts/${accountId}/adCampaigns?q=search`;
    const campRes = await fetch(targetUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'LinkedIn-Version': '202606',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });
    const campData = await campRes.json();
    const campaignsList = campData.elements || [];
    const campaignUrns = campaignsList.map((c) => `urn:li:sponsoredCampaign:${c.id}`);

    if (campaignUrns.length > 0) {
      const campaignsParam = campaignUrns.map(urn => encodeURIComponent(urn)).join(',');
      const analyticsUrl = `https://api.linkedin.com/rest/adAnalytics?q=analytics&pivot=CAMPAIGN&dateRange=(start:(year:2026,month:1,day:1))&timeGranularity=ALL&campaigns=List(${campaignsParam})&fields=costInLocalCurrency,impressions,clicks,pivotValues`;
      console.log('Fetching analytics from:', analyticsUrl);
      const analyticsRes = await fetch(analyticsUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'LinkedIn-Version': '202606',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      console.log('Response:', await analyticsRes.text());
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}
run();
