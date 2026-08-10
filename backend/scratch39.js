const { MongoClient } = require('mongodb');
async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  
  const user = await db.collection('users').findOne({ email: 'wheedletechnologis@gmail.com' });
  const token = user.linkedinAccessToken;

  try {
    const accountUrn = '540750450';
    const today = new Date();
    const since = new Date();
    since.setDate(since.getDate() - 30); // 30 days

    const analyticsUrl = `https://api.linkedin.com/v2/adAnalyticsV2?q=analytics&dateRange.start.year=${since.getFullYear()}&dateRange.start.month=${since.getMonth() + 1}&dateRange.start.day=${since.getDate()}&dateRange.end.year=${today.getFullYear()}&dateRange.end.month=${today.getMonth() + 1}&dateRange.end.day=${today.getDate()}&pivot=CAMPAIGN&accounts=urn%3Ali%3AsponsoredAccount%3A${encodeURIComponent(accountUrn)}&fields=costInLocalCurrency,impressions,clicks,conversions`;
    console.log('Fetching analytics from:', analyticsUrl);
    const analyticsRes = await fetch(analyticsUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });
    console.log('Status:', analyticsRes.status);
    console.log('Body:', await analyticsRes.text());
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}
run();
