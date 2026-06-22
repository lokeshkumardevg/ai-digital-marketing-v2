const { GoogleAdsApi } = require('google-ads-api');
const client = new GoogleAdsApi({ client_id: '1', client_secret: '1', developer_token: '1' });
console.log(typeof client.listAccessibleCustomers);
