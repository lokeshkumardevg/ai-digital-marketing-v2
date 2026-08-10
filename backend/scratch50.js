const { MongoClient, ObjectId } = require('mongodb');
async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  
  const user = await db.collection('users').findOne({ _id: new ObjectId('6a1d324b5291a9f8db25ff2b') });
  const token = user.linkedinAccessToken;
  
  // Enriched campaigns logic simulated from campaigns.service.ts
  const campaignsList = await db.collection('campaigns').find({ userId: '6a1d324b5291a9f8db25ff2b' }).toArray();
  const enrichedCampaigns = campaignsList.map((c) => ({
    ...c,
    isReal: c.isReal || false,
  }));
  
  let externalLinkedInCampaigns = [];
  try {
    const accountsRes = await fetch('https://api.linkedin.com/v2/adAccountsV2?q=search&count=10', {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });
    if (accountsRes.ok) {
      const accountsData = await accountsRes.json();
      const accountId = accountsData.elements?.[0]?.id;
      console.log('Account ID:', accountId);
      if (accountId) {
        const targetUrl = `https://api.linkedin.com/rest/adAccounts/${accountId}/adCampaigns?q=search`;
        const campRes = await fetch(targetUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'LinkedIn-Version': '202606',
            'X-Restli-Protocol-Version': '2.0.0'
          }
        });
        if (campRes.ok) {
          const campData = await campRes.json();
          const list = campData.elements || [];
          console.log('LinkedIn Campaign count from API:', list.length);
          
          const campaignUrns = list.map((c) => `urn:li:sponsoredCampaign:${c.id}`);
          let statsMap = {};
          if (campaignUrns.length > 0) {
            const campaignsParam = campaignUrns.map((urn) => encodeURIComponent(urn)).join(',');
            const analyticsUrl = `https://api.linkedin.com/rest/adAnalytics?q=analytics&pivot=CAMPAIGN&dateRange=(start:(year:2026,month:1,day:1))&timeGranularity=ALL&campaigns=List(${campaignsParam})&fields=costInLocalCurrency,impressions,clicks,pivotValues`;
            const analyticsRes = await fetch(analyticsUrl, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'LinkedIn-Version': '202606',
                'X-Restli-Protocol-Version': '2.0.0'
              }
            });
            if (analyticsRes.ok) {
              const analyticsData = await analyticsRes.json();
              console.log('Analytics Elements retrieved:', analyticsData.elements?.length);
              for (const elem of (analyticsData.elements || [])) {
                const cUrn = elem.pivotValues?.[0];
                if (cUrn) {
                  statsMap[cUrn] = elem;
                }
              }
            }
          }
          
          externalLinkedInCampaigns = list.map((camp) => {
            const campaignUrn = `urn:li:sponsoredCampaign:${camp.id}`;
            const existsInMongo = enrichedCampaigns.some((ec) => {
              if (ec.platform !== 'linkedin') return false;
              const localLiId = ec.data?.linkedinPostId || ec.campaignId;
              return localLiId === campaignUrn;
            });
            if (existsInMongo) return null;
            
            const statsObj = statsMap[campaignUrn] || {};
            const spend = parseFloat(statsObj.costInLocalCurrency || '0');
            const impressions = statsObj.impressions || 0;
            const clicks = statsObj.clicks || 0;
            
            return {
              _id: `ext_linkedin_${camp.id}`,
              id: `ext_linkedin_${camp.id}`,
              campaignId: campaignUrn,
              name: camp.name || 'LinkedIn Campaign',
              platform: 'linkedin',
              status: (camp.status || 'UNKNOWN').toLowerCase(),
              spend,
              impressions,
              clicks,
              isReal: true,
              isExternal: true
            };
          }).filter(Boolean);
        }
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
  
  console.log('Total Campaigns returning:', enrichedCampaigns.length + externalLinkedInCampaigns.length);
  const realCampaigns = [...enrichedCampaigns, ...externalLinkedInCampaigns].filter((c) => c.isReal);
  console.log('Real Campaigns Count:', realCampaigns.length);
  for (const c of realCampaigns) {
    console.log(`- Campaign: ${c.name}, Platform: ${c.platform}, Spend: ${c.spend}, Impressions: ${c.impressions}`);
  }
  process.exit(0);
}
run();
