const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  try {
    await mongoose.connection.collection('analytics').dropIndex('date_1_platform_1');
    console.log('Dropped index date_1_platform_1');
  } catch (e) {
    console.log('Index drop error (might not exist):', e.message);
  }
  process.exit(0);
}

run();
