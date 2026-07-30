const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");
  
  const users = await mongoose.connection.collection('users').find({}).toArray();
  console.log("Users:", users.map(u => ({ id: u._id, email: u.email, role: u.role })));

  const campaigns = await mongoose.connection.collection('campaigns').find({}).toArray();
  console.log("Total Campaigns:", campaigns.length);
  
  const uniqueUsersInCampaigns = [...new Set(campaigns.map(c => c.userId?.toString()))];
  console.log("User IDs in campaigns:", uniqueUsersInCampaigns);
  
  process.exit(0);
}
run();
