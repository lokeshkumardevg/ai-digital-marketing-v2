const mongoose = require('mongoose');

const mongoUri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital';
const userId = '6a1d324b5291a9f8db25ff2b';
const token = 'EAAXh1v5Jy5QBR4NOE2VtvMZAAFNMK8AozCatIbYWqMwMfIeg4sZCAZBvVpmIg6R1gwaxFfFQBZCTeRV8igM2SEb1WMbbC5ZBZBVLH3DLJBTlIZBc9ftK7zmRBbptVvHtNPZBVrEsgjUPPqxhW7IxMZAigJWtHoVU3wGHxWEZALGlInGVbGraLAhWCZCmixjHksJTZBqv7HTDCo68G48mIkUAChXdLvLM0thvtqj6NwCQ4W3Q6nEpSuxaceeIGAZDZD';

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('Connected.');

  console.log('Fetching Meta Ad Accounts using new token...');
  let adAccountId = null;
  let adAccountName = null;

  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/me/adaccounts?fields=account_id,name&access_token=${encodeURIComponent(token)}`);
    const data = await res.json();
    if (res.ok && data.data && data.data.length > 0) {
      const first = data.data[0];
      adAccountId = first.account_id.startsWith('act_') ? first.account_id : `act_${first.account_id}`;
      adAccountName = first.name;
      console.log(`Found Ad Account: ${adAccountName} (${adAccountId})`);
    } else {
      console.log('No ad accounts found or error:', data);
    }
  } catch (err) {
    console.error('Failed to fetch ad accounts:', err.message);
  }

  console.log('Updating user document...');
  const userSchema = new mongoose.Schema({}, { strict: false });
  const User = mongoose.model('User', userSchema, 'users');

  const updateResult = await User.updateOne(
    { _id: new mongoose.Types.ObjectId(userId) },
    {
      $set: {
        metaAccessToken: token,
        ...(adAccountId && { metaAdAccountId: adAccountId }),
        ...(adAccountName && { metaAdAccountName: adAccountName }),
      }
    }
  );

  console.log('Update result:', updateResult);
  await mongoose.disconnect();
  console.log('Done.');
}

run().catch(console.error);
