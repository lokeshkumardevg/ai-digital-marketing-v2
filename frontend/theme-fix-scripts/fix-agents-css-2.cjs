const fs = require('fs');

const filePath = 'd:/ai-digital-marketing-v2/frontend/src/dashboard/pages/Agents.tsx';

let content = fs.readFileSync(filePath, 'utf8');
let orig = content;

content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.08\)/g, "var(--glass-border)");
content = content.replace(/background-color:\s*rgba\(0,\s*0,\s*0,\s*0\.6\)/g, "background-color: var(--glass-bg)");

if (content !== orig) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Updated Agents.tsx CSS second pass");
} else {
  console.log("No changes made.");
}
