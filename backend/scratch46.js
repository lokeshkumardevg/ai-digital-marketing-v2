const { MongoClient, ObjectId } = require('mongodb');
async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  
  const user = await db.collection('users').findOne({ _id: new ObjectId('6a1d324b5291a9f8db25ff2b') });
  const token = user.linkedinAccessToken;
  console.log('User:', user.email);

  try {
    // Exact logic from fetchLinkedInInsights in analytics.service.ts:
    const accountsRes = await fetch('https://api.linkedin.com/v2/adAccountsV2?q=search', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });
    console.log('accountsRes Status:', accountsRes.status);
    const accountsData = await accountsRes.json();
    console.log('accountsData:', JSON.stringify(accountsData, null, 2));

    const accountUrn = accountsData.elements[0].id || accountsData.elements[0].account || accountsData.elements[0].organisations?.[0];
    console.log('accountUrn:', accountUrn);

    const today = new Date();
    const since = new Date();
    since.setDate(since.getDate() - 30); // 30 days

    // Fetch Campaigns under this account using versioned REST API
    const targetUrl = `https://api.linkedin.com/rest/adAccounts/${accountUrn}/adCampaigns?q=search`;
    console.log('Fetching campaigns from:', targetUrl);
    const campRes = await fetch(targetUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'LinkedIn-Version': '202606',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });
    console.log('campRes Status:', campRes.status);
    const campData = await campRes.json();
    console.log('campData elements length:', campData.elements?.length);

    let campaignNames = {};
    let campaignUrns = [];
    for (const c of (campData.elements || [])) {
      const urn = `urn:li:sponsoredCampaign:${c.id}`;
      campaignUrns.push(urn);
      campaignNames[urn] = c.name;
    }

    if (campaignUrns.length === 0) {
      console.log('campaignUrns length is 0. Returning empty.');
      process.exit(0);
    }

    const campaignsParam = campaignUrns.map((urn) => encodeURIComponent(urn)).join(',');
    const analyticsUrl = `https://api.linkedin.com/rest/adAnalytics?q=analytics&pivot=CAMPAIGN&dateRange=(start:(year:${since.getFullYear()},month:${since.getMonth() + 1},day:${since.getDate()}))&timeGranularity=ALL&campaigns=List(${campaignsParam})&fields=costInLocalCurrency,impressions,clicks,pivotValues`;
    console.log('Fetching analytics from:', analyticsUrl);

    const statsRes = await fetch(analyticsUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'LinkedIn-Version': '202606',
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });
    console.log('statsRes Status:', statsRes.status);
    const statsJson = await statsRes.json();
    console.log('statsJson elements:', JSON.stringify(statsJson.elements || [], null, 2));

    const creatives = statsJson.elements.map((element, i) => {
      const campaignUrn = element.pivotValues?.[0] || '';
      const name = campaignNames[campaignUrn] || `Campaign ${i + 1}`;
      const impressions = Number(element.impressions || 0);
      const spend = Number(element.costInLocalCurrency || 0);
      const clicks = Number(element.clicks || 0);
      const conversions = 0;
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      const cpa = conversions > 0 ? spend / conversions : 0;
      const cpc = clicks > 0 ? spend / clicks : 0;
      return {
        id: campaignUrn || `li-${i}`,
        name,
        status: 'ACTIVE',
        cpa: parseFloat(cpa.toFixed(2)),
        cpc: parseFloat(cpc.toFixed(2)),
        ctr: parseFloat(ctr.toFixed(2)),
        spend: parseFloat(spend.toFixed(2)),
        impressions,
        clicks,
        conversions,
        color: '#0A66C2',
      };
    }).filter((c) => c.impressions > 0 || c.clicks > 0 || c.spend > 0);

    console.log('Creatives mapped:', creatives);
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}
run();
