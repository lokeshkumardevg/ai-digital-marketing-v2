const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority');
const schema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', schema, 'users');
async function run() {
  const users = await User.find({}).lean();
  for (const u of users) {
    if (u._id.toString() === '69c2dc0f36b84102fd3dd8d9') {
      console.log("Found user:", u.email, u.metaAdAccountName);
    }
  }
  process.exit(0);
}
run();
