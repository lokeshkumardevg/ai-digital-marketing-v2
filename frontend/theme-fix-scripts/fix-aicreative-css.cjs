const fs = require('fs');

const filePath = 'd:/ai-digital-marketing-v2/frontend/src/dashboard/components/content/AiCreativeWorkspace.tsx';

let content = fs.readFileSync(filePath, 'utf8');
let orig = content;

// Backgrounds
content = content.replace(/background:\s*['"]#0f0f12['"]/g, "background: 'var(--bg-primary)'");
content = content.replace(/background:\s*['"]#14141c['"]/g, "background: 'var(--bg-elevated)'");
content = content.replace(/background:\s*['"]#18181f['"]/g, "background: 'var(--bg-card)'");
content = content.replace(/background:\s*['"]#1e1e27['"]/g, "background: 'var(--bg-card)'");
content = content.replace(/background:\s*['"]#222230['"]/g, "background: 'var(--bg-elevated)'");

// Fallback no quotes
content = content.replace(/background:\s*#0f0f12/g, "background: var(--bg-primary)");
content = content.replace(/background:\s*#14141c/g, "background: var(--bg-elevated)");
content = content.replace(/background:\s*#18181f/g, "background: var(--bg-card)");

// Borders
content = content.replace(/border:\s*['"]1px solid #1e1e27['"]/g, "border: '1px solid var(--glass-border)'");
content = content.replace(/borderBottom:\s*['"]1px solid #1e1e27['"]/g, "borderBottom: '1px solid var(--glass-border)'");
content = content.replace(/borderColor:\s*['"]#222230['"]/g, "borderColor: 'var(--glass-border)'");
content = content.replace(/borderColor:\s*['"]#2a2a38['"]/g, "borderColor: 'var(--glass-border)'");
content = content.replace(/border:\s*['"]1px solid #222230['"]/g, "border: '1px solid var(--glass-border)'");
content = content.replace(/border:\s*['"]1px solid #252530['"]/g, "border: '1px solid var(--glass-border)'");
content = content.replace(/border:\s*['"]1px solid #303040['"]/g, "border: '1px solid var(--glass-border)'");
content = content.replace(/borderTop:\s*['"]1px solid #222230['"]/g, "borderTop: '1px solid var(--glass-border)'");

content = content.replace(/border:\s*['"]1px solid #1e1040['"]/g, "border: '1px solid var(--glass-border)'");
content = content.replace(/border:\s*['"]1px solid #2e1065['"]/g, "border: '1px solid var(--glass-border)'");
content = content.replace(/border:\s*['"]1px solid #4c1d95['"]/g, "border: '1px solid var(--glass-border)'");

// Colors
content = content.replace(/color:\s*['"]#f4f4f6['"]/g, "color: 'var(--text-primary)'");
content = content.replace(/color:\s*['"]#8b8b9e['"]/g, "color: 'var(--text-secondary)'");
content = content.replace(/color:\s*['"]#5a5a72['"]/g, "color: 'var(--text-dim)'");

// In-line styles using hex strings without var()
content = content.replace(/'#18181f'/g, "'var(--bg-card)'");
content = content.replace(/'#14141c'/g, "'var(--bg-elevated)'");
content = content.replace(/'#222230'/g, "'var(--bg-elevated)'");
content = content.replace(/'#1e1e27'/g, "'var(--glass-border)'");

if (content !== orig) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Updated AiCreativeWorkspace.tsx CSS");
} else {
  console.log("No changes made.");
}
