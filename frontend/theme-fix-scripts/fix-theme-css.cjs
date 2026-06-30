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

  // Unquoted Backgrounds
  content = content.replace(/background:\s*#050a18([;}])/g, "background: var(--bg-primary)$1");
  content = content.replace(/background:\s*#0a0f1e([;}])/g, "background: var(--bg-secondary)$1");
  content = content.replace(/background:\s*#0f172a([;}])/g, "background: var(--bg-elevated)$1");
  content = content.replace(/background:\s*#1e293b([;}])/g, "background: var(--bg-card)$1");
  
  content = content.replace(/background-color:\s*#050a18([;}])/g, "background-color: var(--bg-primary)$1");
  content = content.replace(/background-color:\s*#0a0f1e([;}])/g, "background-color: var(--bg-secondary)$1");
  content = content.replace(/background-color:\s*#0f172a([;}])/g, "background-color: var(--bg-elevated)$1");
  content = content.replace(/background-color:\s*#1e293b([;}])/g, "background-color: var(--bg-card)$1");

  // Unquoted Borders
  content = content.replace(/border:\s*1px solid #334155([;}])/g, "border: 1px solid var(--glass-border)$1");
  content = content.replace(/border-color:\s*#334155([;}])/g, "border-color: var(--glass-border)$1");

  // Unquoted Colors
  content = content.replace(/color:\s*#f8fafc([;}])/g, "color: var(--text-primary)$1");
  content = content.replace(/color:\s*#f1f5f9([;}])/g, "color: var(--text-primary)$1");
  content = content.replace(/color:\s*#94a3b8([;}])/g, "color: var(--text-secondary)$1");
  content = content.replace(/color:\s*#64748b([;}])/g, "color: var(--text-dim)$1");

  content = content.replace(/color:\s*#fff([;}])/g, (match, p1, offset, str) => {
    const context = str.substring(Math.max(0, offset - 60), Math.min(str.length, offset + 60));
    if (context.includes('gradient') || context.includes('#0665ff') || context.includes('blue') || context.includes('var(--blue)') || context.includes('btn') || context.includes('#3b82f6')) {
      return match;
    }
    return "color: var(--text-primary)" + p1;
  });

  content = content.replace(/color:\s*white([;}])/g, (match, p1, offset, str) => {
    const context = str.substring(Math.max(0, offset - 60), Math.min(str.length, offset + 60));
    if (context.includes('gradient') || context.includes('#0665ff') || context.includes('blue') || context.includes('var(--blue)') || context.includes('btn') || context.includes('#3b82f6')) {
      return match;
    }
    return "color: var(--text-primary)" + p1;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
    totalReplacements++;
  }
}

processDirectory(directory);
console.log(`Total files updated: ${totalReplacements}`);
