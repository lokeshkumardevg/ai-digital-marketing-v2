const { MongoClient } = require('mongodb');
async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const user = await db.collection('users').findOne({ linkedinAccessToken: { $exists: true, $ne: null } });
  if (!user) return (console.log('No linkedin user'), process.exit(0));
  
  const token = user.linkedinAccessToken;
  console.log('Token length:', token.length);
  
  // Try different LinkedIn org endpoints
  const endpoints = [
    'https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee',
    'https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR',
    'https://api.linkedin.com/v2/organizationAcls?q=roleAssignee',
    'https://api.linkedin.com/rest/organizationAcls?q=roleAssignee',
    'https://api.linkedin.com/v2/organizations?q=member',
  ];

  for (const url of endpoints) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202401',
      }
    });
    const body = await res.text();
    console.log(`\n--- ${url.split('/').pop()} ---`);
    console.log('Status:', res.status);
    if (res.status === 200) console.log('Body:', body.slice(0, 500));
    else console.log('Error:', body.slice(0, 200));
  }
  process.exit(0);
}
run();
