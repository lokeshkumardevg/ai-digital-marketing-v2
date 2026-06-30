const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority');
const schema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', schema, 'users');

async function run() {
  const u = await User.findById('6a1d324b5291a9f8db25ff2b').lean();
  console.log('User details:', {
    _id: u._id,
    email: u.email,
    twitterUserId: u.twitterUserId,
    twitterAccessToken: u.twitterAccessToken ? u.twitterAccessToken.slice(0, 15) + '...' : null,
    twitterRefreshToken: u.twitterRefreshToken ? u.twitterRefreshToken.slice(0, 15) + '...' : null,
  });
  
  if (u.twitterAccessToken) {
    try {
      const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
      const res = await fetch('https://api.twitter.com/2/users/me', {
        headers: { Authorization: `Bearer ${u.twitterAccessToken}` }
      });
      const data = await res.json();
      console.log('Twitter API Profile response:', data);
    } catch (e) {
      console.log('Failed to fetch Twitter profile:', e.message);
    }
  }
  process.exit(0);
}
run();
