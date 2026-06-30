const fs = require('fs');

const filePath = 'd:/ai-digital-marketing-v2/frontend/src/dashboard/pages/Billing.tsx';

let content = fs.readFileSync(filePath, 'utf8');
let orig = content;

content = content.replace(/background:\s*linear-gradient\(145deg,\s*#0d1a2e\s*0%,\s*#091324\s*100%\);/g, "background: var(--bg-elevated); border: 1px solid var(--accent-primary);");
content = content.replace(/background:\s*linear-gradient\(90deg,#0d1420\s*25%,#111827\s*50%,#0d1420\s*75%\);/g, "background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-elevated) 50%, var(--bg-card) 75%);");

if (content !== orig) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Updated Billing.tsx CSS gradients");
} else {
  console.log("No changes made.");
}
