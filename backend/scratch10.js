const { GoogleAdsApi, enums } = require('google-ads-api');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config({ path: 'backend/.env' });

async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const dbClient = new MongoClient(uri);
  await dbClient.connect();
  const db = dbClient.db();
  
  const user = await db.collection('users').findOne({ googleRefreshToken: { $exists: true, $ne: null } });
  if (!user) {
    console.log('No user with google token');
    process.exit(0);
  }

  const developerToken = process.env.GOOGLE_DEVELOPER_TOKEN || 'lcZ3RRE00HWy2i4quLMNuQ';
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  const client = new GoogleAdsApi({
    client_id: clientId,
    client_secret: clientSecret,
    developer_token: developerToken,
  });

  const customerId = "2669431804"; // let's fetch from accessible
  
  try {
    const customer = client.Customer({
      customer_id: customerId,
      refresh_token: user.googleRefreshToken,
    });
    console.log('Attempting to create budget...');
    const budgetResult = await customer.campaignBudgets.create([
      {
        name: `AI Campaign Budget - ${Date.now()}`,
        amount_micros: 10000000,
        delivery_method: enums.BudgetDeliveryMethod.STANDARD,
      }
    ]);
    console.log('Budget created:', budgetResult);
  } catch (err) {
    console.log('ERROR:', err.message);
    if (err.errors) console.log('Details:', JSON.stringify(err.errors, null, 2));
  }
  process.exit(0);
}
run();
