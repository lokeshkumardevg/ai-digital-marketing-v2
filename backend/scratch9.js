const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config({ path: 'backend/.env' });

async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const dbClient = new MongoClient(uri);
  await dbClient.connect();
  const db = dbClient.db();
  
  const users = await db.collection('users').find({ googleAccessToken: { $exists: true, $ne: null } }).toArray();
  if (users.length > 0) {
    console.log('googleRefreshToken:', !!users[0].googleRefreshToken);
    console.log('googleCustomerId:', !!users[0].googleCustomerId);
  }
  process.exit(0);
}
run();
