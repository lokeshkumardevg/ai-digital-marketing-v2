const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority');
const schema = new mongoose.Schema({}, { strict: false });
const Analytics = mongoose.model('Analytics', schema, 'analytics');

async function run() {
  const records = await Analytics.find().sort({ date: -1 }).limit(20).lean();
  console.log('Analytics records:', records);
  process.exit(0);
}
run();
