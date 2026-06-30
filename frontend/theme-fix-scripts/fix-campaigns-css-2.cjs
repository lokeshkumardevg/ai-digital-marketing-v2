const fs = require('fs');

const filePath = 'd:/ai-digital-marketing-v2/frontend/src/dashboard/pages/Campaigns.tsx';

let content = fs.readFileSync(filePath, 'utf8');
let orig = content;

// Replace remaining white backgrounds
content = content.replace(/background:\s*rgba\(255,255,255,0\.08\)/g, "background: var(--bg-card)");
content = content.replace(/background:\s*rgba\(255,255,255,0\.025\)/g, "background: var(--bg-card)");
content = content.replace(/border:\s*1px solid rgba\(255,255,255,0\.07\)/g, "border: 1px solid var(--glass-border)");
content = content.replace(/border:\s*1px solid rgba\(255,255,255,0\.09\)/g, "border: 1px solid var(--glass-border)");

if (content !== orig) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Updated Campaigns.tsx CSS second pass");
} else {
  console.log("No changes made.");
}
