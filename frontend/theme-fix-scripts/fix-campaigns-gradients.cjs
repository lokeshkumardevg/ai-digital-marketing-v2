const fs = require('fs');

const filePath = 'd:/ai-digital-marketing-v2/frontend/src/dashboard/pages/Campaigns.tsx';

let content = fs.readFileSync(filePath, 'utf8');
let orig = content;

// Replace hardcoded light gradients for text
content = content.replace(/background:\s*linear-gradient\(135deg,\s*#e2e8f0\s*0%,\s*#94a3b8\s*100%\);/g, "background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);");

// Replace URL input prefix icon color 
content = content.replace(/<Globe size={17} color="[^"]+" \/>/g, '<Globe size={17} color="currentColor" style={{ color: "var(--text-dim)" }} />');
content = content.replace(/<ShieldCheck size={12} color="[^"]+" \/>/g, '<ShieldCheck size={12} color="currentColor" style={{ color: "var(--text-dim)" }} />');

// Replace sub text colors
content = content.replace(/color:\s*#334155/g, "color: var(--text-dim)");

if (content !== orig) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Updated text gradients in Campaigns.tsx");
} else {
  console.log("No changes made.");
}
