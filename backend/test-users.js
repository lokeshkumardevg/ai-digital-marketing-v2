const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await mongoose.connection.collection('users').find({}).toArray();
  const nullUsers = users.filter(u => !u.name || !u.email);
  console.log("Users without name/email:", nullUsers.length);
  if (nullUsers.length > 0) {
      console.log(nullUsers.map(u => u._id));
  }
  process.exit(0);
}
run();
