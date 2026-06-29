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
  const userSchema = new mongoose.Schema({}, { strict: false });
  const User = mongoose.model('User', userSchema, 'users');

  const user = await User.findOne({ email: 'wheedletechnologis@gmail.com' }).lean();
  if (!user) {
    console.error("User not found");
    process.exit(1);
  }

  console.log("User found:", user.email);
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

  try {
    const customerOptions = {
      customer_id: customerId.replace(/-/g, ''),
      refresh_token: refreshToken,
    };
    if (env.SYSTEM_GOOGLE_MCC_ID) {
      customerOptions.login_customer_id = env.SYSTEM_GOOGLE_MCC_ID.replace(/-/g, '');
    }
    const workingCustomer = clientAuth.Customer(customerOptions);

    console.log("Querying campaigns for customer ID:", customerId, "login_customer_id:", customerOptions.login_customer_id);
    const campaigns = await workingCustomer.query(`
      SELECT campaign.id, campaign.name, campaign.status, campaign_budget.amount_micros
      FROM campaign
    `);

    console.log("Live campaigns on Google Ads:");
    for (const c of campaigns) {
      console.log({
        id: c.campaign.id,
        name: c.campaign.name,
        status: c.campaign.status,
        budget: c.campaign_budget?.amount_micros / 1000000
      });
    }
  } catch (err) {
    console.error("Google Ads API error:", err);
  }

  process.exit(0);
}
run();
