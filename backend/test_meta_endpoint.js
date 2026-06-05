const axios = require('axios');
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority');
const schema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', schema, 'users');

async function run() {
  const user = await User.findOne({ email: 'test@example.com' }).lean();
  if (!user) {
    console.log("No user");
    process.exit(1);
  }
  
  try {
    const res = await axios.post('http://localhost:3000/campaign/meta/publish', {
      userId: user._id.toString(),
      campaignName: 'Frontend API Test Campaign',
      dailyBudget: 15,
      objective: 'OUTCOME_TRAFFIC'
    });
    console.log("Success:", res.data);
  } catch(e) {
    console.log("Error:", e.response ? e.response.data : e.message);
  }
  process.exit(0);
}
run();
