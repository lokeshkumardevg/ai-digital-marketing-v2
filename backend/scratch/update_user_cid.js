const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority');
  
  const userSchema = new mongoose.Schema({}, { strict: false });
  const User = mongoose.model('User', userSchema, 'users');

  const email = 'wheedletechnologis@gmail.com';
  const newCid = '6891945148'; // Client account under MCC 5558904658

  console.log(`Updating googleCustomerId for ${email} to ${newCid}...`);
  
  const result = await User.updateOne(
    { email },
    { $set: { googleCustomerId: newCid } }
  );

  console.log("Update result:", result);
  
  const updatedUser = await User.findOne({ email }).lean();
  console.log("Updated User googleCustomerId is now:", updatedUser.googleCustomerId);

  process.exit(0);
}
run();
