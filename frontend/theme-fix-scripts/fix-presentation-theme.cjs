const fs = require('fs');

const filePath = 'd:/ai-digital-marketing-v2/frontend/src/dashboard/pages/Presentation.css';

let content = fs.readFileSync(filePath, 'utf8');
let orig = content;

const variablesToInject = `
  /* Force dark mode variables for presentation */
  --bg-primary: #050a18 !important;
  --bg-secondary: #0a0f1e !important;
  --bg-card: rgba(10, 15, 30, 0.8) !important;
  --bg-elevated: #0f172a !important;
  --text-primary: #f8fafc !important;
  --text-secondary: #94a3b8 !important;
  --text-dim: #64748b !important;
  --accent-primary: #0665ff !important;
`;

content = content.replace(/\.presentation-root\s*\{/, ".presentation-root {" + variablesToInject);

if (content !== orig) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Updated Presentation.css to force dark mode");
} else {
  console.log("No changes made.");
}
