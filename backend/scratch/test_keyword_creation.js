const mongoose = require('mongoose');
const { GoogleAdsApi, enums } = require('google-ads-api');
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
  const userSchema = new mongoose.Schema({}, { strict: false });
  const User = mongoose.model('User', userSchema, 'users');

  const user = await User.findOne({ email: 'wheedletechnologis@gmail.com' }).lean();
  if (!user) {
    console.error("User not found");
    process.exit(1);
  }

  const clientAuth = new GoogleAdsApi({
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    developer_token: env.GOOGLE_DEVELOPER_TOKEN || 'lcZ3RRE00HWy2i4quLMNuQ',
  });

  const customerId = '6891945148'; // New paid client account
  const loginCustomerId = '5558904658'; // New MCC

  console.log(`Connecting to customer ${customerId} via login_customer_id ${loginCustomerId}...`);

  const workingCustomer = clientAuth.Customer({
    customer_id: customerId,
    login_customer_id: loginCustomerId,
    refresh_token: user.googleRefreshToken,
  });

  try {
    console.log("Fetching last active ad group...");
    const adGroups = await workingCustomer.query(`
      SELECT ad_group.id, ad_group.resource_name, campaign.id, campaign.resource_name 
      FROM ad_group 
      ORDER BY ad_group.id DESC 
      LIMIT 1
    `);

    if (!adGroups.length) {
      console.log("No ad groups found to attach keywords to. Please publish a campaign first.");
      process.exit(0);
    }

    const adGroupResourceName = adGroups[0].ad_group.resource_name;
    console.log("Using AdGroup:", adGroupResourceName);

    console.log("Testing keyword creation syntax...");
    const keywordOperations = [
      {
        ad_group: adGroupResourceName,
        status: enums.AdGroupCriterionStatus.ENABLED,
        keyword: {
          text: 'test digital marketing ' + Date.now().toString().slice(-4),
          match_type: enums.KeywordMatchType.BROAD,
        },
      }
    ];

    const result = await workingCustomer.adGroupCriteria.create(keywordOperations);
    console.log("Success! Keywords created:", JSON.stringify(result, null, 2));

  } catch (err) {
    console.error("Failed to create keywords:");
    if (err.errors) {
      console.error(JSON.stringify(err.errors, null, 2));
    } else {
      console.error(err);
    }
  }

  process.exit(0);
}
run();
