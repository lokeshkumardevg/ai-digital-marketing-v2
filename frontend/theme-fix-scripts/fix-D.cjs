const fs = require('fs');

const files = [
  'd:/ai-digital-marketing-v2/frontend/src/dashboard/pages/OptimizeGoal.tsx',
  'd:/ai-digital-marketing-v2/frontend/src/dashboard/pages/Notifications.tsx',
  'd:/ai-digital-marketing-v2/frontend/src/dashboard/pages/Messaging.tsx',
  'd:/ai-digital-marketing-v2/frontend/src/dashboard/components/SmartTable.tsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf8');
  let orig = c;
  
  c = c.replace(/bg:\s*['"](?:#0a0f1e|var\(--bg-secondary\))['"]/g, "bg: 'var(--bg-secondary)'");
  c = c.replace(/surface:\s*['"]#0f1629['"]/g, "surface: 'var(--bg-elevated)'");
  c = c.replace(/surfaceAlt:\s*['"]#141d35['"]/g, "surfaceAlt: 'var(--bg-card)'");
  c = c.replace(/border:\s*['"]rgba\(99,\s*102,\s*241,\s*0\.18\)['"]/g, "border: 'var(--glass-border)'");
  c = c.replace(/borderGlow:\s*['"]rgba\(112,\s*51,\s*245,\s*0\.35\)['"]/g, "borderGlow: 'var(--glass-border)'");
  c = c.replace(/purple:\s*['"]#0665ff['"]/g, "purple: 'var(--accent-primary)'");
  c = c.replace(/purpleSoft:\s*['"]rgba\(124,\s*58,\s*237,\s*0\.15\)['"]/g, "purpleSoft: 'var(--accent-secondary)'");
  c = c.replace(/purpleText:\s*['"]#a78bfa['"]/g, "purpleText: 'var(--accent-primary)'");
  c = c.replace(/green:\s*['"]#10b981['"]/g, "green: 'var(--success)'");
  c = c.replace(/greenText:\s*['"]#34d399['"]/g, "greenText: 'var(--success)'");
  c = c.replace(/textPrimary:\s*['"]#f1f5f9['"]/g, "textPrimary: 'var(--text-primary)'");
  c = c.replace(/textMuted:\s*['"]#94a3b8['"]/g, "textMuted: 'var(--text-secondary)'");
  c = c.replace(/textDim:\s*['"]#64748b['"]/g, "textDim: 'var(--text-dim)'");
  c = c.replace(/white005:\s*['"]rgba\(255,\s*255,\s*255,\s*0\.05\)['"]/g, "white005: 'var(--bg-card)'");
  c = c.replace(/white010:\s*['"]rgba\(255,\s*255,\s*255,\s*0\.08\)['"]/g, "white010: 'var(--bg-elevated)'");
  c = c.replace(/inputBg:\s*['"]rgba\(255,\s*255,\s*255,\s*0\.04\)['"]/g, "inputBg: 'var(--bg-card)'");
  
  if(c !== orig) {
    fs.writeFileSync(f, c, 'utf8');
    console.log("Updated", f);
  }
});
