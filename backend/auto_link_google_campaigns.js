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
      SELECT campaign.id, campaign.name, campaign.status, campaign.resource_name, campaign_budget.amount_micros, campaign.campaign_budget
      FROM campaign
    `);

    console.log(`Found ${liveCampaigns.length} live campaigns on Google Ads.`);

    for (const lc of liveCampaigns) {
      const gCamp = lc.campaign;
      const gBudget = lc.campaign_budget;
      const gName = gCamp.name;

      console.log(`\nProcessing live campaign: "${gName}" (ID: ${gCamp.id})`);

      // Find the base name (remove timestamp suffix like ' - 1782313615092')
      const baseName = gName.split(' - ')[0];

      // Find matched campaign in MongoDB
      const dbCamp = await Campaign.findOne({
        userId: '6a1d324b5291a9f8db25ff2b',
        platform: 'google',
        name: baseName
      });

      if (dbCamp) {
        console.log(`Matched with MongoDB Campaign: "${dbCamp.name}" (ID: ${dbCamp._id})`);

        // Query ad group and ad details for this campaign
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

        // Update MongoDB campaign with the googleResources and live status
        await Campaign.findByIdAndUpdate(dbCamp._id, {
          $set: {
            'data.googleResources': googleResources,
            status: liveStatus
          }
        });

        console.log(`Linked successfully! Saved googleResources and set status to: ${liveStatus}`);
      } else {
        console.log(`No match found in MongoDB for base name: "${baseName}"`);
      }
    }
  } catch (err) {
    console.error("Error during auto link:", err);
  }

  process.exit(0);
}
run();
