const { MongoClient } = require('mongodb');
async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const user = await db.collection('users').findOne({ linkedinAccessToken: { $exists: true, $ne: null } });
  const token = user.linkedinAccessToken;
  
  const accountUrn = '540750450';
  const today = new Date();
  const since = new Date();
  since.setDate(since.getDate() - 30); // 30 days
  
  // URL from analytics.service.ts
  const analyticsUrl = `https://api.linkedin.com/v2/adAnalyticsV2?q=analytics&dateRange.start.year=${since.getFullYear()}&dateRange.start.month=${since.getMonth() + 1}&dateRange.start.day=${since.getDate()}&dateRange.end.year=${today.getFullYear()}&dateRange.end.month=${today.getMonth() + 1}&dateRange.end.day=${today.getDate()}&pivot=CAMPAIGN&accounts=urn%3Ali%3AsponsoredAccount%3A${encodeURIComponent(accountUrn)}&fields=costInLocalCurrency,impressions,clicks,conversions`;

  console.log('Testing Analytics URL:', analyticsUrl);

  const tests = [
    {
      name: "adAnalyticsV2 basic fetch",
      url: analyticsUrl,
      headers: {
        Authorization: `Bearer ${token}`,
      }
    },
    {
      name: "adAnalyticsV2 with Restli version",
      url: analyticsUrl,
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Restli-Protocol-Version': '2.0.0',
      }
    },
    {
      name: "adAnalyticsV2 with LinkedIn version",
      url: `https://api.linkedin.com/rest/adAnalytics?q=analytics&dateRange.start.year=${since.getFullYear()}&dateRange.start.month=${since.getMonth() + 1}&dateRange.start.day=${since.getDate()}&dateRange.end.year=${today.getFullYear()}&dateRange.end.month=${today.getMonth() + 1}&dateRange.end.day=${today.getDate()}&pivot=CAMPAIGN&accounts=urn%3Ali%3AsponsoredAccount%3A${encodeURIComponent(accountUrn)}&fields=costInLocalCurrency,impressions,clicks,conversions`,
      headers: {
        Authorization: `Bearer ${token}`,
        'LinkedIn-Version': '202605',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    }
  ];

  for (const item of tests) {
    try {
      const res = await fetch(item.url, { headers: item.headers });
      const text = await res.text();
      console.log(`=== ${item.name} ===`);
      console.log('Status:', res.status);
      console.log('Body:', text.slice(0, 500));
    } catch (e) {
      console.error(`Error for ${item.name}:`, e.message);
    }
  }

  process.exit(0);
}
run();
