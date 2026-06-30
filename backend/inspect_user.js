const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority');
const schema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', schema, 'users');

async function run() {
  const users = await User.find({ googleCustomerId: { $exists: true, $ne: '' } }).lean();
  for (const u of users) {
    console.log({
      id: u._id,
      email: u.email,
      googleCustomerId: u.googleCustomerId,
      googleRefreshToken: !!u.googleRefreshToken
    });
  }
  process.exit(0);
}
run();
