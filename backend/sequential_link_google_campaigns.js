const mongoose = require('mongoose');
const { GoogleAdsApi } = require('google-ads-api');
const fs = require('fs');

// Read .env
const envFile = fs.readFileSync('.env', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim();
    env[key] = value;
  }
});

async function run() {
  await mongoose.connect('mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority');
  const schema = new mongoose.Schema({}, { strict: false });
  const Campaign = mongoose.model('Campaign', schema, 'campaigns');
  const User = mongoose.model('User', schema, 'users');

  const user = await User.findOne({ email: 'wheedletechnologis@gmail.com' }).lean();
  if (!user) {
    console.error("User not found");
    process.exit(1);
  }

  const refreshToken = user.googleRefreshToken;
  const customerId = user.googleCustomerId;
  if (!refreshToken || !customerId) {
    console.error("Missing credentials");
    process.exit(1);
  }

  const clientAuth = new GoogleAdsApi({
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    developer_token: env.GOOGLE_DEVELOPER_TOKEN || 'lcZ3RRE00HWy2i4quLMNuQ',
  });

  const customerOptions = {
    customer_id: customerId.replace(/-/g, ''),
    refresh_token: refreshToken,
  };
  if (env.SYSTEM_GOOGLE_MCC_ID) {
    customerOptions.login_customer_id = env.SYSTEM_GOOGLE_MCC_ID.replace(/-/g, '');
  }
  const workingCustomer = clientAuth.Customer(customerOptions);

  try {
    console.log("Fetching live campaigns...");
    const liveCampaigns = await workingCustomer.query(`
      SELECT campaign.id, campaign.name, campaign.status, campaign.resource_name, campaign.campaign_budget
      FROM campaign
    `);

    // Reset googleResources first so we link fresh and correctly
    await Campaign.updateMany(
      { userId: '6a1d324b5291a9f8db25ff2b', platform: 'google' },
      { $unset: { 'data.googleResources': 1 }, $set: { status: 'DRAFT' } }
    );
    console.log("Reset previous googleResources linkages and statuses to DRAFT.");

    // Group live campaigns by base name
    const liveGroups = {};
    for (const lc of liveCampaigns) {
      const gCamp = lc.campaign;
      const gName = gCamp.name;

      const nameParts = gName.split(' - ');
      const baseName = nameParts[0];
      const timestampStr = nameParts[1];

      if (!timestampStr || isNaN(Number(timestampStr))) {
        continue;
      }

      if (!liveGroups[baseName]) {
        liveGroups[baseName] = [];
      }
      liveGroups[baseName].push({
        gCamp,
        timestamp: Number(timestampStr)
      });
    }

    // Sort live campaigns in each group by timestamp ascending
    for (const baseName in liveGroups) {
      liveGroups[baseName].sort((a, b) => a.timestamp - b.timestamp);
    }

    // Link sequentially for each base name
    for (const baseName in liveGroups) {
      const liveCamps = liveGroups[baseName];
      console.log(`\nFound ${liveCamps.length} live campaigns for base name: "${baseName}"`);

      // Find DB campaigns with this name, sorted by _id ascending (chronological order)
      const dbCamps = await Campaign.find({
        userId: '6a1d324b5291a9f8db25ff2b',
        platform: 'google',
        name: baseName
      }).sort({ _id: 1 });

      console.log(`Found ${dbCamps.length} MongoDB campaigns for base name: "${baseName}"`);

      if (dbCamps.length === 0) continue;

      // Link them by index
      // If there are more live campaigns than DB campaigns, match the latest ones.
      const startLiveIndex = Math.max(0, liveCamps.length - dbCamps.length);

      for (let i = 0; i < dbCamps.length; i++) {
        const dbCamp = dbCamps[i];
        // Match with live campaign
        const liveIndex = Math.min(startLiveIndex + i, liveCamps.length - 1);
        const matchedLive = liveCamps[liveIndex];

        console.log(`Linking DB Campaign "${dbCamp.name}" (${dbCamp._id}) to live campaign "${matchedLive.gCamp.name}"`);

        // Fetch ad group/ad details
        let adGroupResourceName = '';
        let adResourceName = '';

        try {
          const adGroupDetails = await workingCustomer.query(`
            SELECT ad_group.resource_name, ad_group_ad.ad.resource_name
            FROM ad_group_ad
            WHERE campaign.id = ${matchedLive.gCamp.id}
            LIMIT 1
          `);
          if (adGroupDetails && adGroupDetails.length > 0) {
            adGroupResourceName = adGroupDetails[0].ad_group?.resource_name || '';
            adResourceName = adGroupDetails[0].ad_group_ad?.ad?.resource_name || '';
          }
        } catch (e) {
          console.warn(`Could not fetch ad group details for campaign ${matchedLive.gCamp.id}: ${e.message}`);
        }

        const googleResources = {
          customerId: customerId.replace(/-/g, ''),
          loginCustomerId: customerOptions.login_customer_id,
          campaignResourceName: matchedLive.gCamp.resource_name,
          budgetResourceName: matchedLive.gCamp.campaign_budget,
          adGroupResourceName,
          adResourceName
        };

        const liveStatus = matchedLive.gCamp.status === 2 || matchedLive.gCamp.status === 'ENABLED' ? 'ACTIVE' : 'PAUSED';

        await Campaign.findByIdAndUpdate(dbCamp._id, {
          $set: {
            'data.googleResources': googleResources,
            status: liveStatus
          }
        });
        console.log(`Linked successfully! Status set to: ${liveStatus}`);
      }
    }

  } catch (err) {
    console.error("Error during sequential link:", err);
  }

  process.exit(0);
}
run();
