const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority');
const schema = new mongoose.Schema({ email: String }, { strict: false });
const User = mongoose.model('User', schema, 'users');

async function run() {
  const users = await User.find({}).lean();
  for (const u of users) {
    if (u.metaAdAccountName) {
      console.log("User:", u.email, "AdAccountName:", u.metaAdAccountName, "AdAccountId:", u.metaAdAccountId);
    }
  }
  process.exit(0);
}
run();
