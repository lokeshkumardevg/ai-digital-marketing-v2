const axios = require('axios');
async function run() {
  const apiKey = 'semrtkn-pat-_oooyD6sQTKKpq4rx62jqQ-C1OkkHRVBCZkRXIX9GpduMnGB38Fifl9';
  const domain = 'google.com';

  const testHeaders = [
    { Authorization: `Bearer ${apiKey}` },
    { Authorization: `Apikey ${apiKey}` }
  ];

  for (const headers of testHeaders) {
    console.log('Testing V3 legacy endpoint with headers:', JSON.stringify(headers));
    try {
      const response = await axios.get('https://api.semrush.com/', {
        params: {
          type: 'domain_ranks',
          domain: domain,
          database: 'us',
          export_columns: 'Dn,Rk,Or,Ot,Oc,Ad,At,Ac',
        },
        headers
      });
      console.log('Success! Status:', response.status);
      console.log('Data:', response.data);
    } catch (err) {
      console.log('Failed. Error:', err.message, err.response ? 'Response: ' + err.response.data : '');
    }
  }

  // Let's test the modern API v4/projects or similar to check if the key is generally active.
  try {
    console.log('Testing V4 backlinks API...');
    const response = await axios.get('https://api.semrush.com/apis/v4/backlinks/v1/links', {
      params: {
        url: domain,
        scope: 'ROOT_DOMAIN',
        fields: 'domain_score',
        limit: 1,
      },
      headers: {
        Authorization: `Apikey ${apiKey}`
      }
    });
    console.log('V4 Backlinks Success! Status:', response.status);
    console.log('V4 Backlinks Data:', JSON.stringify(response.data));
  } catch (err) {
    console.log('V4 Backlinks Failed. Error:', err.message, err.response ? 'Response: ' + JSON.stringify(err.response.data) : '');
  }

  process.exit(0);
}
run();
