const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority');
const schema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', schema, 'users');
async function run() {
  const users = await User.find({}).lean();
  console.log("Total users:", users.length);
  for (const u of users) {
    if (u.metaAdAccountName) {
      console.log("User:", u.email, "AdAccountName:", u.metaAdAccountName, "AdAccountId:", u.metaAdAccountId);
    } else {
      console.log("User without ad account name:", u.email);
    }
  }
  process.exit(0);
}
run();
