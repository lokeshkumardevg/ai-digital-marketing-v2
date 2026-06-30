const fs = require('fs');

const filePath = 'd:/ai-digital-marketing-v2/frontend/src/dashboard/pages/OptimizeGoal.tsx';

let content = fs.readFileSync(filePath, 'utf8');
let orig = content;

// Replace D object values
content = content.replace(/bg:\s*['"]#080d1a['"]/g, "bg: 'var(--bg-primary)'");
content = content.replace(/surfaceHover:\s*['"]rgba\(255,255,255,0\.04\)['"]/g, "surfaceHover: 'var(--bg-elevated)'");
content = content.replace(/textDim:\s*['"]#475569['"]/g, "textDim: 'var(--text-dim)'");
content = content.replace(/white004:\s*['"]rgba\(255,255,255,0\.04\)['"]/g, "white004: 'var(--bg-card)'");
content = content.replace(/white008:\s*['"]rgba\(255,255,255,0\.08\)['"]/g, "white008: 'var(--bg-elevated)'");
content = content.replace(/white012:\s*['"]rgba\(255,255,255,0\.12\)['"]/g, "white012: 'var(--glass-border)'");

// Replace DarkSection hardcoded values
content = content.replace(/background:\s*['"]#0f1629['"]/g, "background: 'var(--bg-card)'");
content = content.replace(/background:\s*#0f1629/g, "background: var(--bg-card)");
content = content.replace(/border:\s*['"]1px solid rgba\(99,102,241,0\.18\)['"]/g, "border: '1px solid var(--glass-border)'");
content = content.replace(/border:\s*['"]1px solid rgba\(99,102,241,0\.25\)['"]/g, "border: '1px solid var(--glass-border)'");

// ConnectPlatformModal hardcoded values
content = content.replace(/background:\s*['"]rgba\(0,0,0,0\.7\)['"]/g, "background: 'var(--glass-bg)'");

if (content !== orig) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Updated OptimizeGoal.tsx CSS");
} else {
  console.log("No changes made.");
}
