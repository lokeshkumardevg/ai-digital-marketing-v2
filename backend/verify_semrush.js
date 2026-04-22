const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.SEMRUSH_API_KEY;
const domain = 'google.com';
const database = 'us';

async function test() {
  console.log('Testing Semrush API with key:', apiKey.substring(0, 5) + '...');
  try {
    const response = await axios.get('https://api.semrush.com/', {
      params: {
        key: apiKey,
        type: 'domain_ranks',
        domain: domain,
        database: database,
        export_columns: 'Dn,Rk,Or,Ot,Oc,Ad,At,Ac',
      },
    });
    console.log('Response Status:', response.status);
    console.log('Response Data Preview:', response.data.substring(0, 200));
  } catch (error) {
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Error Data:', error.response.data);
    }
  }
}

test();
