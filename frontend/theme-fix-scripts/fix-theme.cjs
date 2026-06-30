const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/dashboard/pages/Crm.tsx',
  'src/dashboard/pages/Campaigns.tsx',
  'src/dashboard/pages/Campaigns.css',
  'src/dashboard/pages/AdsManager.tsx',
  'src/dashboard/pages/DraftAiRecs.tsx',
  'src/dashboard/pages/Content.tsx',
  'src/dashboard/components/content/AiCreativeModal.tsx',
  'src/dashboard/pages/OptimizeGoal.tsx',
  'src/dashboard/pages/Messaging.tsx',
  'src/dashboard/pages/Agents.tsx',
  'src/dashboard/pages/Billing.tsx',
  'src/dashboard/pages/LinkedInCrm.tsx',
  'src/dashboard/pages/Users.tsx',
  'src/dashboard/pages/Notifications.tsx',
  'src/dashboard/components/Header.tsx',
  'src/dashboard/components/Header.css',
  'src/dashboard/components/Sidebar.tsx',
  'src/App.tsx'
];

const workspaceRoot = 'd:/ai-digital-marketing-v2/frontend';

let totalReplacements = 0;

filesToUpdate.forEach(file => {
  const filePath = path.join(workspaceRoot, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skip: ${file} not found`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Background replacements
  content = content.replace(/background:\s*['"]#050a18['"]/g, "background: 'var(--bg-primary)'");
  content = content.replace(/background:\s*['"]#0a0f1e['"]/g, "background: 'var(--bg-secondary)'");
  content = content.replace(/background:\s*['"]#0f172a['"]/g, "background: 'var(--bg-elevated)'");
  content = content.replace(/background:\s*['"]#1e293b['"]/g, "background: 'var(--bg-card)'");
  
  content = content.replace(/background-color:\s*['"]#050a18['"]/g, "background-color: 'var(--bg-primary)'");
  content = content.replace(/background-color:\s*['"]#0a0f1e['"]/g, "background-color: 'var(--bg-secondary)'");
  content = content.replace(/backgroundColor:\s*['"]#0a0f1e['"]/g, "backgroundColor: 'var(--bg-secondary)'");
  content = content.replace(/backgroundColor:\s*['"]#050a18['"]/g, "backgroundColor: 'var(--bg-primary)'");

  content = content.replace(/background:\s*['"]rgba\(15,\s*22,\s*41,\s*0\.95\)['"]/g, "background: 'var(--glass-bg)'");
  content = content.replace(/background:\s*['"]rgba\(255,\s*255,\s*255,\s*0\.04\)['"]/g, "background: 'var(--bg-card)'");
  content = content.replace(/background:\s*['"]rgba\(255,\s*255,\s*255,\s*0\.05\)['"]/g, "background: 'var(--bg-card)'");
  content = content.replace(/background:\s*['"]rgba\(255,\s*255,\s*255,\s*0\.02\)['"]/g, "background: 'var(--bg-card)'");
  content = content.replace(/background:\s*['"]rgba\(255,255,255,0\.04\)['"]/g, "background: 'var(--bg-card)'");

  // CSS file replacements (no quotes)
  content = content.replace(/background:\s*#050a18;/g, "background: var(--bg-primary);");
  content = content.replace(/background:\s*#0a0f1e;/g, "background: var(--bg-secondary);");
  content = content.replace(/background:\s*#0f172a;/g, "background: var(--bg-elevated);");
  content = content.replace(/background-color:\s*#050a18;/g, "background-color: var(--bg-primary);");
  content = content.replace(/background-color:\s*#0a0f1e;/g, "background-color: var(--bg-secondary);");
  
  // Borders
  content = content.replace(/border:\s*['"]1px solid rgba\(255,\s*255,\s*255,\s*0\.1\)['"]/g, "border: '1px solid var(--glass-border)'");
  content = content.replace(/border:\s*['"]1px solid rgba\(255,\s*255,\s*255,\s*0\.06\)['"]/g, "border: '1px solid var(--glass-border)'");
  content = content.replace(/border:\s*['"]1px solid rgba\(255,\s*255,\s*255,\s*0\.08\)['"]/g, "border: '1px solid var(--glass-border)'");
  content = content.replace(/borderBottom:\s*['"]1px solid rgba\(255,\s*255,\s*255,\s*0\.06\)['"]/g, "borderBottom: '1px solid var(--glass-border)'");
  content = content.replace(/borderRight:\s*['"]1px solid rgba\(255,\s*255,\s*255,\s*0\.06\)['"]/g, "borderRight: '1px solid var(--glass-border)'");
  content = content.replace(/borderTop:\s*['"]1px solid rgba\(255,\s*255,\s*255,\s*0\.06\)['"]/g, "borderTop: '1px solid var(--glass-border)'");
  content = content.replace(/borderColor:\s*['"]#334155['"]/g, "borderColor: 'var(--glass-border)'");
  content = content.replace(/border:\s*['"]1px solid #334155['"]/g, "border: '1px solid var(--glass-border)'");
  
  content = content.replace(/border:\s*1px solid rgba\(255,\s*255,\s*255,\s*0\.1\);/g, "border: 1px solid var(--glass-border);");

  // Specific color text replacements (be careful with white)
  // We will replace color: '#fff' only if it's accompanied by a generic background or text block.
  // Actually, replacing color: '#fff' is risky, let's target specific hexes that are strictly dark mode text.
  content = content.replace(/color:\s*['"]#f8fafc['"]/g, "color: 'var(--text-primary)'");
  content = content.replace(/color:\s*['"]#f1f5f9['"]/g, "color: 'var(--text-primary)'");
  content = content.replace(/color:\s*['"]#94a3b8['"]/g, "color: 'var(--text-secondary)'");
  content = content.replace(/color:\s*['"]#64748b['"]/g, "color: 'var(--text-dim)'");
  
  // Replace white text when background is dark or card
  content = content.replace(/color:\s*['"]#fff['"]/g, (match, offset, str) => {
    // Look around for context. If we are in a btn or blue background, keep #fff.
    // Heuristic: If there is 'background' with gradient or blue nearby (within 50 chars), keep it.
    const context = str.substring(Math.max(0, offset - 50), Math.min(str.length, offset + 50));
    if (context.includes('gradient') || context.includes('#0665ff') || context.includes('blue') || context.includes('var(--blue)')) {
      return match;
    }
    return "color: 'var(--text-primary)'";
  });

  content = content.replace(/color:\s*['"]white['"]/g, (match, offset, str) => {
    const context = str.substring(Math.max(0, offset - 50), Math.min(str.length, offset + 50));
    if (context.includes('gradient') || context.includes('#0665ff') || context.includes('blue') || context.includes('var(--blue)')) {
      return match;
    }
    return "color: 'var(--text-primary)'";
  });
  
  // Custom dark-theme classes
  content = content.replace(/ className="app-container dark-theme"/g, ' className="app-container"');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${file}`);
    totalReplacements++;
  }
});

console.log(`Total files updated: ${totalReplacements}`);
