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

  const clientAuth = new GoogleAdsApi({
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    developer_token: env.GOOGLE_DEVELOPER_TOKEN || 'lcZ3RRE00HWy2i4quLMNuQ',
  });

  const mccId = '5558904658'; // New Manager ID
  console.log("Checking ALL accounts recursively under Manager ID:", mccId);

  try {
    const managerCustomer = clientAuth.Customer({
      customer_id: mccId,
      login_customer_id: mccId,
      refresh_token: user.googleRefreshToken,
    });

    const clients = await managerCustomer.query(`
      SELECT customer_client.id, customer_client.descriptive_name, customer_client.manager, customer_client.level
      FROM customer_client
    `);

    console.log("All accounts recursively under manager 5558904658:");
    for (const c of clients) {
      console.log({
        id: c.customer_client.id,
        name: c.customer_client.descriptive_name,
        isManager: c.customer_client.manager,
        level: c.customer_client.level
      });
    }
  } catch (err) {
    console.error("Google Ads API error:", err);
  }

  process.exit(0);
}
run();
