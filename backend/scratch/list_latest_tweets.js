const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority');
const schema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', schema, 'users');

async function run() {
  const u = await User.findById('6a1d324b5291a9f8db25ff2b').lean();
  if (u.twitterAccessToken) {
    try {
      const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
      const url = `https://api.twitter.com/2/users/${u.twitterUserId}/tweets?max_results=5`;
      console.log('Fetching tweets from:', url);
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${u.twitterAccessToken}` }
      });
      const data = await res.json();
      console.log('Latest Tweets on profile:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Failed to fetch tweets:', e.message);
    }
  }
  process.exit(0);
}
run();
