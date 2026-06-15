const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken'); // Assuming jsonwebtoken is used
async function run() {
  const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const user = await db.collection('users').findOne({ email: 'Wheedletechnologis@gmail.com' });
  
  if (!user) return process.exit(0);

  // Read JWT secret from .env
  const fs = require('fs');
  const env = fs.readFileSync('backend/.env', 'utf8');
  const secretMatch = env.match(/JWT_SECRET=(.*)/);
  const secret = secretMatch ? secretMatch[1] : 'my_super_secret_key_123!';
  
  const token = jwt.sign({ sub: user._id.toString(), email: user.email }, secret);
  
  const res = await fetch('http://localhost:3000/api/auth/x', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Body:', text.slice(0, 500));
  
  process.exit(0);
}
run();
