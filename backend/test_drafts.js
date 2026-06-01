const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority');
const schema = new mongoose.Schema({}, { strict: false });
const Campaign = mongoose.model('Campaign', schema, 'campaigns');
async function run() {
  const c = await Campaign.find().lean();
  console.log("Total campaigns:", c.length);
  c.forEach(x => {
    console.log(`ID: ${x._id}, Name: ${x.name}, Platform: ${x.platform}`);
  });
  process.exit(0);
}
run();
