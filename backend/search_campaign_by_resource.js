const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority');
  const schema = new mongoose.Schema({}, { strict: false });
  const Campaign = mongoose.model('Campaign', schema, 'campaigns');

  const ids = ['23940243306', '23949121886', '23949200381', '23950030003', '23953867096', '23966219991', '23966225511', '23969872535', '23970906374', '23972098060', '23975428006', '23975453275', '23975775304'];

  for (const id of ids) {
    const regex = new RegExp(id, 'i');
    const matched = await Campaign.find({
      $or: [
        { campaignId: regex },
        { 'data.googleResources.campaignResourceName': regex },
        { 'data.googleResources.campaignResourceName': { $regex: regex } }
      ]
    }).lean();

    if (matched.length > 0) {
      console.log(`Google campaign ID ${id} matched:`, matched.map(m => ({ _id: m._id, name: m.name, platform: m.platform })));
    }
  }

  process.exit(0);
}
run();
