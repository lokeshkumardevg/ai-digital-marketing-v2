const fs = require('fs');

const filePath = 'd:/ai-digital-marketing-v2/frontend/src/dashboard/pages/Content.tsx';

let content = fs.readFileSync(filePath, 'utf8');
let orig = content;

// Backgrounds
content = content.replace(/background:\s*['"]#0f1117['"]/g, "background: 'var(--bg-primary)'");
content = content.replace(/background:\s*['"]#12141e['"]/g, "background: 'var(--bg-elevated)'");
content = content.replace(/background:\s*['"]#1a1d27['"]/g, "background: 'var(--bg-card)'");
content = content.replace(/backgroundColor:\s*['"]#0f1117['"]/g, "backgroundColor: 'var(--bg-primary)'");
content = content.replace(/backgroundColor:\s*['"]#12141e['"]/g, "backgroundColor: 'var(--bg-elevated)'");
content = content.replace(/backgroundColor:\s*['"]#1a1d27['"]/g, "backgroundColor: 'var(--bg-card)'");

// Fallbacks without quotes
content = content.replace(/background:\s*#0f1117/g, "background: var(--bg-primary)");
content = content.replace(/background:\s*#12141e/g, "background: var(--bg-elevated)");
content = content.replace(/background:\s*#1a1d27/g, "background: var(--bg-card)");

// Borders
content = content.replace(/border:\s*['"]1px solid #22253a['"]/g, "border: '1px solid var(--glass-border)'");
content = content.replace(/borderBottom:\s*['"]1px solid #22253a['"]/g, "borderBottom: '1px solid var(--glass-border)'");
content = content.replace(/borderBottom:\s*['"]1px solid #1a1d27['"]/g, "borderBottom: '1px solid var(--glass-border)'");
content = content.replace(/borderColor:\s*['"]#2e3141['"]/g, "borderColor: 'var(--glass-border)'");
content = content.replace(/border:\s*['"]1px solid #2a2d3a['"]/g, "border: '1px solid var(--glass-border)'");
content = content.replace(/border:\s*['"]2px solid #2a2d3a['"]/g, "border: '2px solid var(--glass-border)'");

content = content.replace(/border:\s*['"]1px solid #1a1d27['"]/g, "border: '1px solid var(--glass-border)'");

// Colors
content = content.replace(/color:\s*['"]#f0f0f5['"]/g, "color: 'var(--text-primary)'");
content = content.replace(/color:\s*['"]#c9cad4['"]/g, "color: 'var(--text-primary)'");
content = content.replace(/color:\s*['"]#a0a0b0['"]/g, "color: 'var(--text-secondary)'");
content = content.replace(/color:\s*['"]#6b7280['"]/g, "color: 'var(--text-dim)'");

// Hover states or conditional background
content = content.replace(/'#2a2d3a'/g, "'var(--bg-elevated)'");
content = content.replace(/'#22253a'/g, "'var(--glass-border)'");
content = content.replace(/'#1a1d27'/g, "'var(--bg-card)'");
content = content.replace(/'#12141e'/g, "'var(--bg-elevated)'");
content = content.replace(/'#0f1117'/g, "'var(--bg-primary)'");
content = content.replace(/'#c9cad4'/g, "'var(--text-primary)'");
content = content.replace(/'#f0f0f5'/g, "'var(--text-primary)'");
content = content.replace(/'#a0a0b0'/g, "'var(--text-secondary)'");

if (content !== orig) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Updated Content.tsx CSS");
} else {
  console.log("No changes made.");
}
