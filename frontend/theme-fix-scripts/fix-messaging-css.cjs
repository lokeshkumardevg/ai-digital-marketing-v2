const fs = require('fs');

const filePath = 'd:/ai-digital-marketing-v2/frontend/src/dashboard/pages/Messaging.tsx';

let content = fs.readFileSync(filePath, 'utf8');
let orig = content;

// Replace D object values
content = content.replace(/bg:\s*['"]#080d1a['"]/g, "bg: 'var(--bg-primary)'");
content = content.replace(/surfaceAlt:\s*['"]var\(--bg-card\)['"]/g, "surfaceAlt: 'var(--bg-card)'");
content = content.replace(/textDim:\s*['"]#475569['"]/g, "textDim: 'var(--text-dim)'");
content = content.replace(/white004:\s*['"]rgba\(255,255,255,0\.04\)['"]/g, "white004: 'var(--bg-card)'");
content = content.replace(/white008:\s*['"]rgba\(255,255,255,0\.08\)['"]/g, "white008: 'var(--bg-elevated)'");

if (content !== orig) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Updated Messaging.tsx CSS");
} else {
  console.log("No changes made.");
}
