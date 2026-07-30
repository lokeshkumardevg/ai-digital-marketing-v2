const fs = require('fs');
const content = fs.readFileSync('/Users/mac/Desktop/latest_clone_digital_marketing/ai-digital-marketing-v2/backend/src/campaigns/campaigns.service.ts', 'utf8');
const match = content.match(/async getCampaignsByUser[\s\S]*?(?=async|public)/);
console.log(match ? match[0] : 'Not found');
