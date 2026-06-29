const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority');
  const schema = new mongoose.Schema({}, { strict: false });
  const Campaign = mongoose.model('Campaign', schema, 'campaigns');

  console.log("Connected to MongoDB.");

  // Update Google campaigns that do NOT have a campaignResourceName to 'DRAFT' status
  const query = {
    platform: 'google',
    $or: [
      { 'data.googleResources.campaignResourceName': { $exists: false } },
      { 'data.googleResources.campaignResourceName': null },
      { 'data.googleResources.campaignResourceName': '' }
    ]
  };

  const campaignsToUpdate = await Campaign.find(query).lean();
  console.log(`Found ${campaignsToUpdate.length} Google campaigns without campaignResourceName.`);

  const result = await Campaign.updateMany(query, {
    $set: { status: 'DRAFT' }
  });

  console.log(`Successfully updated ${result.modifiedCount} campaign documents to DRAFT status.`);
  process.exit(0);
}
run();
