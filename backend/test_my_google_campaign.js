const axios = require('axios');

async function testGoogleCampaign() {
  console.log('Testing Google Campaign endpoint...');
  try {
    const payload = {
      platform: 'google',
      adAccount: 'test-account',
      campaignName: 'Test Google Campaign from Backend Script',
      budget: 10,
      currency: 'USD',
      url: 'https://example.com'
    };

    const res = await axios.post('http://localhost:3000/campaign/publish', payload);
    console.log('Success!', res.data);
  } catch (error) {
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', error.response.data);
    } else {
      console.error('Error Message:', error.message);
    }
  }
}

testGoogleCampaign();
