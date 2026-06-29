const { MongoClient, ObjectId } = require('mongodb');
const axios = require('axios');

async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  const mainUserEmail = 'wheedletechnologis@gmail.com';
  const testUserEmail = 'test@example.com';

  console.log('Step 1: Finding users in database...');
  const mainUser = await db.collection('users').findOne({ email: mainUserEmail });
  const testUser = await db.collection('users').findOne({ email: testUserEmail });

  if (!mainUser || !testUser) {
    console.log('Error: Users not found');
    process.exit(1);
  }

  // 1. Copy Meta Token
  console.log(`Copying metaAccessToken from ${testUserEmail} to ${mainUserEmail}...`);
  await db.collection('users').updateOne(
    { _id: mainUser._id },
    { $set: { metaAccessToken: testUser.metaAccessToken } }
  );
  console.log('Meta Access Token successfully updated.');

  // 2. Fetch Meta Campaigns from Facebook API
  console.log(`Fetching Meta Campaigns for Account: ${mainUser.metaAdAccountId}...`);
  let metaCampaigns = [];
  try {
    const res = await axios.get(`https://graph.facebook.com/v20.0/${mainUser.metaAdAccountId}/campaigns`, {
      params: {
        access_token: testUser.metaAccessToken,
        fields: 'id,name,status,effective_status,created_time'
      }
    });
    metaCampaigns = res.data?.data || [];
    console.log(`Found ${metaCampaigns.length} campaigns on Meta Ads Manager API.`);
  } catch (err) {
    console.error('Failed to fetch Meta campaigns:', err.response?.data || err.message);
  }

  // Sort API campaigns by creation time (chronologically)
  metaCampaigns.sort((a, b) => new Date(a.created_time) - new Date(b.created_time));

  // Fetch local Meta campaigns for mainUser, sorted by creation date
  const localMetaCampaigns = await db.collection('campaigns').find({
    userId: mainUser._id.toString(),
    platform: 'meta',
    campaignId: { $regex: /^CMP_|[0-9a-f]{8}-[0-9a-f]{4}/ } // Mock campaignId formats
  }).sort({ createdAt: 1 }).toArray();

  console.log(`Found ${localMetaCampaigns.length} local mock Meta campaigns to link.`);

  // Chronologically link local Meta campaigns to Meta API campaigns
  const linkCount = Math.min(localMetaCampaigns.length, metaCampaigns.length);
  for (let i = 0; i < linkCount; i++) {
    const local = localMetaCampaigns[i];
    const apiCamp = metaCampaigns[i];
    console.log(`Linking local Meta [${local.name}] -> API Meta Campaign [${apiCamp.name}] (ID: ${apiCamp.id})`);
    
    await db.collection('campaigns').updateOne(
      { _id: local._id },
      {
        $set: {
          campaignId: apiCamp.id,
          'data.metaCampaignId': apiCamp.id,
          status: apiCamp.effective_status || apiCamp.status || 'ACTIVE'
        }
      }
    );
  }

  // 3. Try to fetch LinkedIn Campaigns using different query patterns
  console.log('Testing LinkedIn Campaign fetches...');
  const token = mainUser.linkedinAccessToken;
  const adAccountId = 540750450;
  
  if (token) {
    const patterns = [
      `https://api.linkedin.com/rest/adCampaigns?q=search&search=(account:(values:List(urn%3Ali%3AsponsoredAccount%3A${adAccountId})))`,
      `https://api.linkedin.com/rest/adCampaigns?q=search&search.account.values[0]=urn:li:sponsoredAccount:${adAccountId}`,
      `https://api.linkedin.com/rest/adAccounts/${adAccountId}/adCampaigns`,
    ];

    for (const url of patterns) {
      try {
        console.log(`GET ${url}`);
        const r = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'LinkedIn-Version': '202605',
            'X-Restli-Protocol-Version': '2.0.0'
          }
        });
        const status = r.status;
        const text = await r.text();
        console.log(`Response Status: ${status}`);
        if (r.ok) {
          console.log(`SUCCESS! Response: ${text.slice(0, 300)}...`);
          break;
        } else {
          console.log(`FAILED: ${text.slice(0, 200)}`);
        }
      } catch (e) {
        console.log(`Error pattern: ${e.message}`);
      }
    }
  }

  console.log('Done linking and testing.');
  process.exit(0);
}
run();
