const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config({ path: 'backend/.env' });

async function run() {
  const devToken = process.env.GOOGLE_DEVELOPER_TOKEN || 'lcZ3RRE00HWy2i4quLMNuQ';
  // Use invalid token and see if it returns 404 HTML
  const headers = {
    'Authorization': `Bearer invalid_token`,
    'developer-token': devToken,
  };
  try {
    const res = await axios.post('https://googleads.googleapis.com/v16/customers/1234567890/campaignBudgets:mutate', { operations: [] }, { headers });
    console.log(res.data);
  } catch (e) {
    if (e.response) {
      console.log('Status:', e.response.status);
      console.log('Data:', e.response.data);
    } else {
      console.log(e.message);
    }
  }
}
run();
