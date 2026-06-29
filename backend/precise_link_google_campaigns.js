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

    for (const lc of liveCampaigns) {
      const gCamp = lc.campaign;
      const gName = gCamp.name;

      const nameParts = gName.split(' - ');
      const baseName = nameParts[0];
      const timestampStr = nameParts[1];

      if (!timestampStr || isNaN(Number(timestampStr))) {
        console.log(`Skipping non-app campaign or missing timestamp suffix: "${gName}"`);
        continue;
      }

      const gTimestamp = Number(timestampStr);

      // Find all campaigns in MongoDB matching the base name
      const dbCamps = await Campaign.find({
        userId: '6a1d324b5291a9f8db25ff2b',
        platform: 'google',
        name: baseName
      }).lean();

      if (dbCamps.length === 0) {
        console.log(`No match in MongoDB for: "${baseName}"`);
        continue;
      }

      // Find the campaign created closest to (and before) the Google Ads campaign creation time
      let bestMatch = null;
      let minDiff = Infinity;

      for (const dbc of dbCamps) {
        const dbTimestamp = dbc._id.getTimestamp().getTime();
        const diff = gTimestamp - dbTimestamp;

        // The local DB campaign must be created before the live campaign, and within 30 minutes proximity
        if (diff >= 0 && diff < 1800000 && diff < minDiff) {
          minDiff = diff;
          bestMatch = dbc;
        }
      }

      if (bestMatch) {
        console.log(`Matched live campaign "${gName}" to MongoDB campaign "${bestMatch.name}" (${bestMatch._id}) with time diff of ${(minDiff / 1000).toFixed(1)}s`);

        // Fetch ad group/ad details
        let adGroupResourceName = '';
        let adResourceName = '';

        try {
          const adGroupDetails = await workingCustomer.query(`
            SELECT ad_group.resource_name, ad_group_ad.ad.resource_name
            FROM ad_group_ad
            WHERE campaign.id = ${gCamp.id}
            LIMIT 1
          `);
          if (adGroupDetails && adGroupDetails.length > 0) {
            adGroupResourceName = adGroupDetails[0].ad_group?.resource_name || '';
            adResourceName = adGroupDetails[0].ad_group_ad?.ad?.resource_name || '';
          }
        } catch (e) {
          console.warn(`Could not fetch ad group details for campaign ${gCamp.id}: ${e.message}`);
        }

        const googleResources = {
          customerId: customerId.replace(/-/g, ''),
          loginCustomerId: customerOptions.login_customer_id,
          campaignResourceName: gCamp.resource_name,
          budgetResourceName: gCamp.campaign_budget,
          adGroupResourceName,
          adResourceName
        };

        const liveStatus = gCamp.status === 2 || gCamp.status === 'ENABLED' ? 'ACTIVE' : 'PAUSED';

        await Campaign.findByIdAndUpdate(bestMatch._id, {
          $set: {
            'data.googleResources': googleResources,
            status: liveStatus
          }
        });
        console.log(`Linked successfully! Status set to: ${liveStatus}`);
      } else {
        console.log(`No matching creation timestamp found in MongoDB for "${gName}"`);
      }
    }
  } catch (err) {
    console.error("Error during precise auto link:", err);
  }

  process.exit(0);
}
run();
