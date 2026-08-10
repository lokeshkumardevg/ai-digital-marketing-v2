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
    const campaignId = 856638496; // One of the campaign ids
    
    // Fetch analytics for a campaign
    const campaignsParam = encodeURIComponent(`urn:li:sponsoredCampaign:${campaignId}`);
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
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}
run();
