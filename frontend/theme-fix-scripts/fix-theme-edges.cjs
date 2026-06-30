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

  // Presentation.css !important cases
  content = content.replace(/#050a18 !important/g, "var(--bg-primary) !important");
  content = content.replace(/#050a18/g, "var(--bg-primary)");
  
  // AiAnalysis.tsx text color
  content = content.replace(/color:\s*isPending \? ['"]#94a3b8['"] : ['"]#0f172a['"]/g, "color: isPending ? 'var(--text-dim)' : 'var(--text-primary)'");

  // Header.css specifics
  content = content.replace(/color:\s*#1e293b;/g, "color: var(--text-primary);");
  content = content.replace(/--glass-border:\s*#0a0f1e;/g, "--glass-border: rgba(0, 0, 0, 0.1);");

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
    totalReplacements++;
  }
}

processDirectory(directory);
console.log(`Total files updated: ${totalReplacements}`);
