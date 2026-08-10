const axios = require('axios');
async function run() {
  const apiKey = 'semrtkn-pat-_oooyD6sQTKKpq4rx62jqQ-C1OkkHRVBCZkRXIX9GpduMnGB38Fifl9';
  const domain = 'google.com';
  
  try {
    const response = await axios.get('https://api.semrush.com/', {
      params: {
        key: apiKey,
        type: 'domain_ranks',
        domain: domain,
        database: 'us',
        export_columns: 'Dn,Rk,Or,Ot,Oc,Ad,At,Ac',
      },
    });
    console.log('V3 API Status:', response.status);
    console.log('V3 API Data:', response.data);
  } catch (err) {
    console.error('V3 API Error:', err.message);
    if (err.response) {
      console.error('V3 API Response:', err.response.data);
    }
  }
  process.exit(0);
}
run();
