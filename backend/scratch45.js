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

    const accountsParam = encodeURIComponent(`urn:li:sponsoredAccount:${accountUrn}`);
    const analyticsUrl = `https://api.linkedin.com/rest/adAnalytics?q=analytics&pivot=ACCOUNT&dateRange=(start:(year:${since.getFullYear()},month:${since.getMonth() + 1},day:${since.getDate()}))&timeGranularity=ALL&accounts=List(${accountsParam})&fields=costInLocalCurrency,impressions,clicks`;
    console.log('Fetching account analytics from:', analyticsUrl);
    const analyticsRes = await fetch(analyticsUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'LinkedIn-Version': '202606',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });
    console.log('Status:', analyticsRes.status);
    console.log('Body:', await analyticsRes.text());
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}
run();
