const fs = require('fs');

const filePath = 'd:/ai-digital-marketing-v2/frontend/src/dashboard/pages/DraftAiRecs.tsx';

let content = fs.readFileSync(filePath, 'utf8');
let orig = content;

// Backgrounds
content = content.replace(/background:\s*['"]#060f24['"]/g, "background: 'var(--bg-elevated)'");
content = content.replace(/background:\s*['"]#0a1428['"]/g, "background: 'var(--bg-card)'");
content = content.replace(/background:\s*['"]#0a1733['"]/g, "background: 'var(--bg-elevated)'");
content = content.replace(/background:\s*['"]#0d0a2e['"]/g, "background: 'var(--bg-card)'");
content = content.replace(/background:\s*['"]#0d1e3a['"]/g, "background: 'var(--bg-card)'");
content = content.replace(/background:\s*['"]#0f1040['"]/g, "background: 'var(--bg-card)'");
content = content.replace(/background:\s*['"]#071c4a['"]/g, "background: 'var(--bg-secondary)'");
content = content.replace(/background:\s*['"]rgba\(4,13,31,\.7\)['"]/g, "background: 'var(--glass-bg)'");
content = content.replace(/background:\s*['"]rgba\(4,13,31,\.85\)['"]/g, "background: 'var(--glass-bg)'");
content = content.replace(/background:\s*['"]rgba\(4,13,31,\.92\)['"]/g, "background: 'var(--glass-bg)'");
content = content.replace(/background:\s*['"]rgba\(4,13,31,\.93\)['"]/g, "background: 'var(--glass-bg)'");
content = content.replace(/background:\s*['"]#05201a['"]/g, "background: 'var(--bg-elevated)'");

// Fallback for missing quotes if any
content = content.replace(/background:\s*#060f24/g, "background: var(--bg-elevated)");
content = content.replace(/background:\s*#0a1428/g, "background: var(--bg-card)");
content = content.replace(/background:\s*#0a1733/g, "background: var(--bg-elevated)");

// Borders
content = content.replace(/border:\s*['"]1px solid #1a2d50['"]/g, "border: '1px solid var(--glass-border)'");
content = content.replace(/borderTop:\s*['"]1px solid #1a2d50['"]/g, "borderTop: '1px solid var(--glass-border)'");
content = content.replace(/borderBottom:\s*['"]1px solid #1a2d50['"]/g, "borderBottom: '1px solid var(--glass-border)'");
content = content.replace(/border:\s*['"]1px solid #1a3a7a['"]/g, "border: '1px solid var(--glass-border)'");
content = content.replace(/border:\s*['"]2px solid #1a3a7a['"]/g, "border: '2px solid var(--glass-border)'");
content = content.replace(/border:\s*`1px solid #1a3a7a`/g, "border: `1px solid var(--glass-border)`");
content = content.replace(/border:\s*['"]1px solid #3730a3['"]/g, "border: '1px solid var(--glass-border)'");
content = content.replace(/border:\s*['"]1px solid #4c1d95['"]/g, "border: '1px solid var(--glass-border)'");

// Colors
content = content.replace(/color:\s*['"]#8aaad8['"]/g, "color: 'var(--text-secondary)'");
content = content.replace(/color:\s*['"]#e2eaff['"]/g, "color: 'var(--text-primary)'");
content = content.replace(/color:\s*['"]#1a2d50['"]/g, "color: 'var(--text-dim)'"); // fallback for some weird icon color?

// Edge cases for background in inline styles (e.g. ternary)
content = content.replace(/'#05201a' : '#0a1733'/g, "'var(--success)' : 'var(--bg-elevated)'");
content = content.replace(/'#065f46' : '#1a2d50'/g, "'var(--success)' : 'var(--glass-border)'");

// Check if there are linear gradients hardcoded
content = content.replace(/linear-gradient\(90deg, #0a1733 25%, #0d1e3a 50%, #0a1733 75%\)/g, "linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-card) 50%, var(--bg-elevated) 75%)");
content = content.replace(/linear-gradient\(90deg, #0a1733 25%, #0d2040 50%, #0a1733 75%\)/g, "linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-card) 50%, var(--bg-elevated) 75%)");

if (content !== orig) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Updated DraftAiRecs.tsx CSS");
} else {
  console.log("No changes made.");
}
