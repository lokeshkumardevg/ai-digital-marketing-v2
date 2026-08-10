const { MongoClient, ObjectId } = require('mongodb');
async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  
  const user = await db.collection('users').findOne({ _id: new ObjectId('6a43618e8bb1ddd78386a159') });
  if (user) {
    console.log('User:', user.email, 'Name:', user.name);
    console.log('LinkedIn Token:', user.linkedinAccessToken ? 'Yes' : 'No');
    console.log('Google Token:', user.googleRefreshToken ? 'Yes' : 'No');
    console.log('Meta Token:', user.metaAccessToken ? 'Yes' : 'No');
  } else {
    console.log('User not found.');
  }
  process.exit(0);
}
run();
