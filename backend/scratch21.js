const mongoose = require('mongoose');

const mongoUri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital';
const userId = '6a1d324b5291a9f8db25ff2b';

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('Connected.');

  console.log('Clearing Meta Access Token in DB (Disconnecting)...');
  const userSchema = new mongoose.Schema({}, { strict: false });
  const User = mongoose.model('User', userSchema, 'users');

  const updateResult = await User.updateOne(
    { _id: new mongoose.Types.ObjectId(userId) },
    {
      $unset: {
        metaAccessToken: "",
        metaAdAccountId: "",
        metaAdAccountName: ""
      }
    }
  );

  console.log('Update result:', updateResult);
  await mongoose.disconnect();
  console.log('Done.');
}

run().catch(console.error);
