const fs = require('fs');

const filePath = 'd:/ai-digital-marketing-v2/frontend/src/dashboard/pages/Billing.tsx';

let content = fs.readFileSync(filePath, 'utf8');
let orig = content;

// Replace embedded CSS variables
content = content.replace(/--bg-base:\s*#[a-f0-9]+;/gi, "--bg-base: var(--bg-primary);");
content = content.replace(/--bg-1:\s*#[a-f0-9]+;/gi, "--bg-1: var(--bg-card);");
content = content.replace(/--bg-2:\s*#[a-f0-9]+;/gi, "--bg-2: var(--bg-elevated);");
content = content.replace(/--bg-3:\s*#[a-f0-9]+;/gi, "--bg-3: var(--bg-elevated);");
content = content.replace(/--bg-4:\s*#[a-f0-9]+;/gi, "--bg-4: var(--glass-border);");
content = content.replace(/--border:\s*rgba\([^)]+\);/gi, "--border: var(--glass-border);");
content = content.replace(/--border2:\s*rgba\([^)]+\);/gi, "--border2: var(--glass-border);");
content = content.replace(/--border3:\s*rgba\([^)]+\);/gi, "--border3: var(--glass-border);");
content = content.replace(/--text:\s*#[a-f0-9]+;/gi, "--text: var(--text-primary);");
content = content.replace(/--text2:\s*#[a-f0-9]+;/gi, "--text2: var(--text-secondary);");
content = content.replace(/--text3:\s*#[a-f0-9]+;/gi, "--text3: var(--text-dim);");
content = content.replace(/:root\s*\{/g, ".bl {"); // Scope these to .bl rather than global :root

if (content !== orig) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Updated Billing.tsx CSS variables");
} else {
  console.log("No changes made.");
}
