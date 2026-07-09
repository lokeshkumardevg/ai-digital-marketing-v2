const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/dashboard/components/Adcampaigndashboard.tsx',
  'src/dashboard/pages/Crm.tsx',
  'src/dashboard/pages/Messaging.tsx',
  'src/dashboard/pages/Seo.tsx',
  'src/dashboard/pages/Settings.tsx'
];

for (const file of filesToFix) {
  const filePath = path.join(__dirname, 'frontend', file);
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Add static import at the top if it doesn't exist
  if (!content.includes("import { api } from '../../api/axios'")) {
    // Find the last import statement to insert after
    const importRegex = /^import .* from .*$/gm;
    let match;
    let lastIndex = 0;
    while ((match = importRegex.exec(content)) !== null) {
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex > 0) {
      content = content.slice(0, lastIndex) + "\nimport { api } from '../../api/axios';" + content.slice(lastIndex);
    } else {
      content = "import { api } from '../../api/axios';\n" + content;
    }
  }

  // Replace `const { api } = await import('../../api/axios');` with nothing
  content = content.replace(/^[ \t]*const\s+\{\s*api\s*\}\s*=\s*await\s+import\('\.\.\/\.\.\/api\/axios'\);\s*$/gm, '');
  content = content.replace(/const\s+\{\s*api\s*\}\s*=\s*await\s+import\('\.\.\/\.\.\/api\/axios'\);/g, '');

  // Replace `import('../../api/axios').then(({ api }) => {`
  content = content.replace(/import\('\.\.\/\.\.\/api\/axios'\)/g, 'Promise.resolve({ api })');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed:', file);
}
