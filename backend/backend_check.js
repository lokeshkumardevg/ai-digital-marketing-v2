const fs = require('fs');
const content = fs.readFileSync('/Users/mac/Desktop/latest_clone_digital_marketing/ai-digital-marketing-v2/backend/src/analytics/analytics.service.ts', 'utf8');
const lines = content.split('\n');
const start = lines.findIndex(l => l.includes('fetchGoogleInsights('));
const fn = lines.slice(start, start + 100).join('\n');
console.log(fn);
