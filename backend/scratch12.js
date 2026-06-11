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
  if (!user) return process.exit(0);

  const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    developer_token: process.env.GOOGLE_DEVELOPER_TOKEN || 'lcZ3RRE00HWy2i4quLMNuQ',
  });

  const customers = ['2769788956', '5558904658'];
  
  for (const c of customers) {
    try {
      const customer = client.Customer({
        customer_id: c,
        refresh_token: user.googleRefreshToken,
      });
      const res = await customer.query(`
        SELECT customer.id, customer.manager, customer.descriptive_name 
        FROM customer 
        LIMIT 1
      `);
      console.log(`Customer ${c}:`, res[0]?.customer);
    } catch (err) {
      if (err.errors) console.log(`Customer ${c} ERROR:`, JSON.stringify(err.errors));
    }
  }
  process.exit(0);
}
run();
