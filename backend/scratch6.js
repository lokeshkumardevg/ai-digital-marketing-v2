const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config({ path: 'backend/.env' });

async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const dbClient = new MongoClient(uri);
  await dbClient.connect();
  const db = dbClient.db();
  
  const accounts = await db.collection('linkedinaccounts').find({}).toArray();
  console.log('LinkedInAccounts found:', accounts.length);
  if (accounts.length > 0) {
    console.log(accounts[0].linkedinId, accounts[0].profileName);
  } else {
    const usersWithLn = await db.collection('users').find({ linkedinAccessToken: { $exists: true, $ne: null } }).toArray();
    console.log('Users with LinkedIn token:', usersWithLn.length);
  }
  process.exit(0);
}
run();
