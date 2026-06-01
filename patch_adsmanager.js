const fs = require('fs');
const file = 'frontend/src/dashboard/pages/AdsManager.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `    fetch('http://localhost:3000/campaigns', {
      headers: { 'Authorization': \`Bearer \${localStorage.getItem('access_token')}\` }
    })
    .then(res => res.json())
    .then(json => {`;

const replacement = `    const userStr = localStorage.getItem('auth_user') || localStorage.getItem('user');
    let userId = '';
    try { if (userStr) userId = JSON.parse(userStr)._id || JSON.parse(userStr).id; } catch(e){}
    
    fetch('http://localhost:3000/campaign/draft/' + userId, {
      headers: { 'Authorization': \`Bearer \${localStorage.getItem('access_token')}\` }
    })
    .then(res => res.json())
    .then(resData => {
      const json = Array.isArray(resData) ? resData : (resData.drafts || []);
`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync(file, code);
  console.log("Patched successfully.");
} else {
  console.log("Could not find target.");
}
