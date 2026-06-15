const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect('mongodb://localhost:27017/ai_digital');

  const db = mongoose.connection.db;
  const result = await db.collection('users').updateMany(
    { googleCustomerId: { $exists: true } },
    { $unset: { googleCustomerId: "" } }
  );

  console.log(`Cleared googleCustomerId from ${result.modifiedCount} users.`);
  mongoose.disconnect();
}

run();
