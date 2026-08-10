const fs = require('fs');
const path = require('path');

const targetFile = '/Users/mac/Desktop/latest_clone_digital_marketing/ai-digital-marketing-v2/backend/src/ai/webhook.controller.ts';
let content = fs.readFileSync(targetFile, 'utf8');

const updated = content.replace(/localhost:8001/g, 'localhost:8003');
fs.writeFileSync(targetFile, updated, 'utf8');

console.log('Successfully replaced all occurrences of localhost:8001 with localhost:8003 in webhook.controller.ts');
process.exit(0);
