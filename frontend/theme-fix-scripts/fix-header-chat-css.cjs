const fs = require('fs');

const filePath = 'd:/ai-digital-marketing-v2/frontend/src/dashboard/components/Header.tsx';

let content = fs.readFileSync(filePath, 'utf8');
let orig = content;

content = content.replace(/background:\s*['"]rgba\(15, 23, 42, 0\.85\)['"]/g, "background: 'var(--glass-bg)'");
content = content.replace(/background:\s*['"]rgba\(0, 0, 0, 0\.15\)['"]/g, "background: 'var(--bg-elevated)'");
content = content.replace(/background:\s*['"]rgba\(0, 0, 0, 0\.3\)['"]/g, "background: 'var(--bg-card)'");
content = content.replace(/background:\s*m\.role === 'user' \? '#635bff' : 'rgba\(255, 255, 255, 0\.04\)'/g, "background: m.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-elevated)'");
content = content.replace(/border:\s*m\.role === 'user' \? 'none' : '1px solid rgba\(255, 255, 255, 0\.05\)'/g, "border: m.role === 'user' ? 'none' : '1px solid var(--glass-border)'");
content = content.replace(/border:\s*['"]1px solid rgba\(255, 255, 255, 0\.05\)['"]/g, "border: '1px solid var(--glass-border)'");

if (content !== orig) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Updated Header.tsx AI Chat CSS");
} else {
  console.log("No changes made.");
}
