const fs = require('fs');

const filePath = 'd:/ai-digital-marketing-v2/frontend/src/dashboard/pages/DraftAiRecs.tsx';

let content = fs.readFileSync(filePath, 'utf8');
let orig = content;

// Dashboard container
content = content.replace(/background:\s*#040d1f/g, "background: var(--bg-primary)");

// CSS block variables and values
content = content.replace(/--surface:\s*#060f24/g, "--surface: var(--bg-elevated)");
content = content.replace(/--surface2:\s*#0a1428/g, "--surface2: var(--bg-card)");
content = content.replace(/--surface3:\s*#0d1e3a/g, "--surface3: var(--bg-secondary)");
content = content.replace(/border:\s*2px solid #0a1428/g, "border: 2px solid var(--bg-card)");

content = content.replace(/background:\s*#060f24/g, "background: var(--bg-elevated)");
content = content.replace(/background-color:\s*#060f24/g, "background-color: var(--bg-elevated)");
content = content.replace(/background:\s*#0a1428/g, "background: var(--bg-card)");
content = content.replace(/background-color:\s*#0a1428/g, "background-color: var(--bg-card)");
content = content.replace(/background:\s*#0a1733/g, "background: var(--bg-elevated)");
content = content.replace(/background:\s*#0d1e3a/g, "background: var(--bg-secondary)");

// Texts and borders 
content = content.replace(/color:\s*#8aaad8/g, "color: var(--text-secondary)");
content = content.replace(/color:\s*#a78bfa/g, "color: var(--accent-primary)");
content = content.replace(/color:\s*#e2eaff/g, "color: var(--text-primary)");
content = content.replace(/border:\s*1px solid #1a2d50/g, "border: 1px solid var(--glass-border)");
content = content.replace(/borderTop:\s*1px solid #1a2d50/g, "borderTop: 1px solid var(--glass-border)");
content = content.replace(/borderBottom:\s*1px solid #1a2d50/g, "borderBottom: 1px solid var(--glass-border)");
content = content.replace(/border-bottom:\s*1px solid #1a2d50/g, "border-bottom: 1px solid var(--glass-border)");

// One more check for inline styles
content = content.replace(/'#060f24'/g, "'var(--bg-elevated)'");
content = content.replace(/'#040d1f'/g, "'var(--bg-primary)'");
content = content.replace(/'#0a1428'/g, "'var(--bg-card)'");

if (content !== orig) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Updated DraftAiRecs.tsx DASH_CSS");
} else {
  console.log("No changes made.");
}
