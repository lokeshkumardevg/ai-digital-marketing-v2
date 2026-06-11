const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config({ path: 'backend/.env' });

async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  // Get the user and check what fields we have
  const user = await db.collection('users').findOne({ twitterAccessToken: { $exists: true, $ne: null } });
  console.log('Token type (first 10 chars):', user?.twitterAccessToken?.slice(0, 10));
  
  // The stored access token might be an OAuth 1.0a token, not OAuth 2.0
  // Check if it looks like "userId-..." format 
  console.log('Token starts with userId?', user?.twitterAccessToken?.startsWith(user?.twitterUserId));
  
  // Try with the token as-is using different authorization format  
  // OAuth 1.0a user context tokens start with userId-<rest>
  const tokenParts = user?.twitterAccessToken?.split('-');
  console.log('Token parts count:', tokenParts?.length);
  console.log('Full stored token value:', user?.twitterAccessToken);
  process.exit(0);
}
run();
