const fs = require('fs');
const content = fs.readFileSync('/Users/mac/Desktop/latest_clone_digital_marketing/ai-digital-marketing-v2/backend/src/campaigns/campaigns.service.ts', 'utf8');
const startIndex = content.indexOf('async getCampaignsByUser');
const endIndex = content.indexOf('async toggleCampaignStatus', startIndex);
const part = content.substring(startIndex + 3500, endIndex);
console.log(part);
