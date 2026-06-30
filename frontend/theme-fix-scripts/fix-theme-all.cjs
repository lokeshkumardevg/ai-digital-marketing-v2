const fs = require('fs');
const path = require('path');

const directory = 'd:/ai-digital-marketing-v2/frontend/src/dashboard';

let totalReplacements = 0;

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css') || fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  });
}

function processFile(filePath) {
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
  content = content.replace(/bg:\s*['"]#0a0f1e['"]/g, "bg: 'var(--bg-secondary)'");
  content = content.replace(/surface:\s*['"]#050a18['"]/g, "surface: 'var(--bg-primary)'");

  content = content.replace(/background:\s*['"]rgba\(15,\s*22,\s*41,\s*0\.95\)['"]/g, "background: 'var(--glass-bg)'");
  content = content.replace(/background:\s*['"]rgba\(255,\s*255,\s*255,\s*0\.04\)['"]/g, "background: 'var(--bg-card)'");
  content = content.replace(/background:\s*['"]rgba\(255,\s*255,\s*255,\s*0\.05\)['"]/g, "background: 'var(--bg-card)'");
  content = content.replace(/background:\s*['"]rgba\(255,\s*255,\s*255,\s*0\.02\)['"]/g, "background: 'var(--bg-card)'");
  content = content.replace(/background:\s*['"]rgba\(255,255,255,0\.04\)['"]/g, "background: 'var(--bg-card)'");

  // CSS file replacements (no quotes)
  content = content.replace(/background:\s*#050a18;/g, "background: var(--bg-primary);");
  content = content.replace(/background:\s*#0a0f1e;/g, "background: var(--bg-secondary);");
  content = content.replace(/background:\s*#0f172a;/g, "background: var(--bg-elevated);");
  content = content.replace(/background:\s*#1e293b;/g, "background: var(--bg-card);");
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
  content = content.replace(/color:\s*['"]#f8fafc['"]/g, "color: 'var(--text-primary)'");
  content = content.replace(/color:\s*['"]#f1f5f9['"]/g, "color: 'var(--text-primary)'");
  content = content.replace(/color:\s*['"]#94a3b8['"]/g, "color: 'var(--text-secondary)'");
  content = content.replace(/color:\s*['"]#64748b['"]/g, "color: 'var(--text-dim)'");
  
  // Replace white text when background is dark or card
  content = content.replace(/color:\s*['"]#fff['"]/g, (match, offset, str) => {
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

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
    totalReplacements++;
  }
}

processDirectory(directory);
console.log(`Total files updated: ${totalReplacements}`);
