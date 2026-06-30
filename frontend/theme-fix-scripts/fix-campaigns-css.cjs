const fs = require('fs');

const filePath = 'd:/ai-digital-marketing-v2/frontend/src/dashboard/pages/Campaigns.tsx';

let content = fs.readFileSync(filePath, 'utf8');
let orig = content;

// Replace Backgrounds
content = content.replace(/background:\s*#020408/g, "background: var(--bg-primary)");
content = content.replace(/background:\s*#0a0a0f/g, "background: var(--bg-primary)");
content = content.replace(/background:\s*#020817/g, "background: var(--bg-elevated)");
content = content.replace(/background:\s*#080810/g, "background: var(--bg-elevated)");
content = content.replace(/background:\s*#0d1117/g, "background: var(--bg-card)");
content = content.replace(/background:\s*rgba\(12,14,22,0\.95\)/g, "background: var(--glass-bg)");
content = content.replace(/background:\s*rgba\(12,16,28,0\.95\)/g, "background: var(--glass-bg)");
content = content.replace(/background:\s*rgba\(12,16,28,0\.97\)/g, "background: var(--glass-bg)");
content = content.replace(/background:\s*rgba\(12,18,30,0\.95\)/g, "background: var(--glass-bg)");
content = content.replace(/background:\s*rgba\(15,23,42,0\.95\)/g, "background: var(--glass-bg)");
content = content.replace(/background:\s*rgba\(15,23,42,0\.7\)/g, "background: var(--bg-card)");
content = content.replace(/background:\s*rgba\(20,20,30,0\.85\)/g, "background: var(--bg-card)");
content = content.replace(/background:\s*rgba\(2,6,23,0\.9\)/g, "background: var(--glass-bg)");
content = content.replace(/background:\s*#000/g, "background: var(--bg-primary)");
content = content.replace(/background:\s*rgba\(255,255,255,0\.05\)/g, "background: var(--bg-card)");
content = content.replace(/background:\s*rgba\(255,255,255,0\.04\)/g, "background: var(--bg-card)");
content = content.replace(/background:\s*rgba\(255,255,255,0\.03\)/g, "background: var(--bg-card)");
content = content.replace(/background:\s*rgba\(255,255,255,0\.06\)/g, "background: var(--bg-elevated)");
content = content.replace(/background-color:\s*#020408/g, "background-color: var(--bg-primary)");

// Replace text colors
content = content.replace(/color:\s*#e2e8f0/g, "color: var(--text-primary)");
content = content.replace(/color:\s*#cbd5e1/g, "color: var(--text-primary)");
content = content.replace(/color:\s*#334155/g, "color: var(--text-secondary)");
content = content.replace(/color:\s*#4b5563/g, "color: var(--text-dim)");
content = content.replace(/color:\s*#475569/g, "color: var(--text-dim)");

// Replace border colors
content = content.replace(/border:\s*1px solid rgba\(255,255,255,0\.05\)/g, "border: 1px solid var(--glass-border)");
content = content.replace(/border:\s*1px solid rgba\(255,255,255,0\.06\)/g, "border: 1px solid var(--glass-border)");
content = content.replace(/border-bottom:\s*1px solid rgba\(255,255,255,0\.05\)/g, "border-bottom: 1px solid var(--glass-border)");
content = content.replace(/border:\s*1px solid rgba\(255,255,255,0\.14\)/g, "border: 1px solid var(--glass-border)");
content = content.replace(/border:\s*1px solid rgba\(255,255,255,0\.08\)/g, "border: 1px solid var(--glass-border)");

// Add specific replacement for color: #fff that doesn't break buttons
content = content.replace(/color:\s*#fff/g, (match, offset, str) => {
  const context = str.substring(Math.max(0, offset - 50), Math.min(str.length, offset + 50));
  if (context.includes('gradient') || context.includes('blue') || context.includes('btn') || context.includes('submit')) {
    return match; // preserve #fff
  }
  return "color: var(--text-primary)";
});

if (content !== orig) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Updated Campaigns.tsx CSS");
} else {
  console.log("No changes made.");
}
