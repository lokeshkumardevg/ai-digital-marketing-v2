const mongoose = require('mongoose');
const axios = require('axios');
mongoose.connect('mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority');
const schema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', schema, 'users');
async function run() {
  const user = await User.findOne({ email: 'test@example.com' }).lean();
  if (!user || !user.metaAccessToken) {
    console.log("No token");
    process.exit(1);
  }
  
  try {
    const res = await axios.post(`https://graph.facebook.com/v20.0/${user.metaAdAccountId}/campaigns`, {
      name: 'Test Campaign',
      objective: 'OUTCOME_TRAFFIC',
      status: 'PAUSED',
      special_ad_categories: ['NONE'], // NONE!
      daily_budget: 10000,
      access_token: user.metaAccessToken
    });
    console.log("Success:", res.data);
  } catch(e) {
    console.log("Error from Meta:", e.response ? e.response.data.error : e.message);
  }
  process.exit(0);
}
run();
