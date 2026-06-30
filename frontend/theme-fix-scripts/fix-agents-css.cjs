const fs = require('fs');

const filePath = 'd:/ai-digital-marketing-v2/frontend/src/dashboard/pages/Agents.tsx';

let content = fs.readFileSync(filePath, 'utf8');
let orig = content;

// Replace background colors
content = content.replace(/background:\s*['"]?rgba\(15,\s*23,\s*42,\s*0\.6\)['"]?/g, "background: var(--bg-card)");
content = content.replace(/background:\s*['"]?rgba\(15,\s*23,\s*42,\s*0\.8\)['"]?/g, "background: var(--glass-bg)");
content = content.replace(/background:\s*['"]?rgba\(30,\s*41,\s*59,\s*0\.6\)['"]?/g, "background: var(--bg-elevated)");

// Replace translucent white overlays 
content = content.replace(/background:\s*['"]?rgba\(255,255,255,0\.05\)['"]?/g, "background: var(--bg-elevated)");
content = content.replace(/background:\s*['"]?rgba\(255,255,255,0\.1\)['"]?/g, "background: var(--glass-border)");

// Replace text colors
content = content.replace(/color:\s*['"]?#94a3b8['"]?/g, "color: var(--text-dim)");
content = content.replace(/color:\s*['"]?#cbd5e1['"]?/g, "color: var(--text-secondary)");
content = content.replace(/color:\s*['"]?#e2e8f0['"]?/g, "color: var(--text-primary)");
content = content.replace(/color:\s*['"]?#f8fafc['"]?/g, "color: var(--text-primary)");

// Fix any borders
content = content.replace(/border:\s*['"]?1px solid rgba\(255,255,255,0\.1\)['"]?/g, "border: 1px solid var(--glass-border)");
content = content.replace(/border:\s*['"]?1px solid rgba\(255,255,255,0\.05\)['"]?/g, "border: 1px solid var(--glass-border)");

if (content !== orig) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Updated Agents.tsx CSS");
} else {
  console.log("No changes made.");
}
