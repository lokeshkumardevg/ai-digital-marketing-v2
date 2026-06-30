const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority');
const schema = new mongoose.Schema({}, { strict: false });
const Campaign = mongoose.model('Campaign', schema, 'campaigns');

async function run() {
  const campaigns = await Campaign.find({ userId: '6a1d324b5291a9f8db25ff2b' }).lean();
  console.log(`Campaigns for user wheedletechnologis@gmail.com: ${campaigns.length}`);
  for (const c of campaigns) {
    console.log({
      id: c._id,
      campaignId: c.campaignId,
      name: c.name,
      platform: c.platform,
      status: c.status,
      hasGoogleResources: !!c.data?.googleResources,
      campaignResourceName: c.data?.googleResources?.campaignResourceName,
    });
  }
  process.exit(0);
}
run();
