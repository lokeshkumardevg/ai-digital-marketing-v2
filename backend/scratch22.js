const { MongoClient } = require('mongodb');
async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const user = await db.collection('users').findOne({ linkedinAccessToken: { $exists: true, $ne: null } });
  if (!user) return process.exit(0);
  const token = user.linkedinAccessToken;
  
  const versions = ['202310', '202307', '202305', '202302', '202212'];
  for (const ver of versions) {
    const res = await fetch('https://api.linkedin.com/rest/organizationAcls?q=roleAssignee&count=50', {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': ver,
      }
    });
    const body = await res.text();
    console.log(`v${ver} → Status ${res.status}: ${body.slice(0,150)}`);
    if (res.status === 200) break;
  }
  process.exit(0);
}
run();
