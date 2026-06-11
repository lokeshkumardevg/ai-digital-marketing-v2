const { GoogleAdsApi } = require('google-ads-api');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config({ path: 'backend/.env' });

async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const dbClient = new MongoClient(uri);
  await dbClient.connect();
  const db = dbClient.db();
  
  const user = await db.collection('users').findOne({ googleRefreshToken: { $exists: true, $ne: null } }, { sort: { _id: -1 } });
  
  const devToken = process.env.GOOGLE_DEVELOPER_TOKEN || 'lcZ3RRE00HWy2i4quLMNuQ';

  const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    developer_token: devToken,
  });

  try {
    const customers = await client.listAccessibleCustomers(user.googleRefreshToken);
    console.log(JSON.stringify(customers, null, 2));
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
run();
