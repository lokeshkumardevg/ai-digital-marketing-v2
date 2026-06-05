const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority');
const schema = new mongoose.Schema({ email: String, metaAdAccountName: String }, { strict: false });
const User = mongoose.model('User', schema, 'users');

async function run() {
  const user = await User.findOne({ email: 'test@example.com' });
  const obj = user.toObject ? user.toObject() : user;
  console.log("toObject output keys:", Object.keys(obj));
  console.log("metaAdAccountName in toObject:", obj.metaAdAccountName);
  process.exit(0);
}
run();
