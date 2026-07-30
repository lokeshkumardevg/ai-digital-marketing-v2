const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';

async function reset() {
  await mongoose.connect(uri);
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('password123', salt);
  
  const res = await User.updateOne(
    { email: 'test_dashboard@example.com' },
    { $set: { passwordHash: hash, permissions: ['*'] } }
  );
  
  console.log('Update result:', res);
  process.exit(0);
}

reset().catch(console.error);
