const mongoose = require('mongoose');
const { GoogleAdsApi } = require('google-ads-api');
require('dotenv').config();

async function run() {
  await mongoose.connect('mongodb://localhost:27017/ai-digital-marketing');
  const user = await mongoose.connection.collection('users').findOne({ googleRefreshToken: { $exists: true, $ne: null } });
  if (!user) {
    console.log('No user with googleRefreshToken found');
    process.exit(0);
    return;
  }
  
  console.log('Testing for user:', user.email);
  
  const clientAuth = new GoogleAdsApi({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    developer_token: process.env.GOOGLE_DEVELOPER_TOKEN,
  });

  try {
    const listRes = await clientAuth.listAccessibleCustomers(user.googleRefreshToken);
    console.log('Accessible Customers for User:', JSON.stringify(listRes, null, 2));
  } catch (err) {
    console.error('List Accessible Customers Error:', err.message || err);
  }
  process.exit(0);
}
run();
