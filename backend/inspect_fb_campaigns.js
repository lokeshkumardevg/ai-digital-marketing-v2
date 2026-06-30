const { MongoClient } = require('mongodb');
const axios = require('axios');

async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  
  // Find test user who has the meta token
  const user = await db.collection('users').findOne({ email: 'test@example.com' });
  if (!user || !user.metaAccessToken) {
    console.log('No user with meta token found');
    process.exit(0);
  }

  console.log(`Using metaAdAccountId: ${user.metaAdAccountId}`);
  try {
    const res = await axios.get(`https://graph.facebook.com/v20.0/${user.metaAdAccountId}/campaigns`, {
      params: {
        access_token: user.metaAccessToken,
        fields: 'id,name,status,effective_status'
      }
    });
    console.log('Campaigns in Meta Ad Account:');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Failed to fetch Meta campaigns:', err.response?.data || err.message);
  }
  process.exit(0);
}
run();
