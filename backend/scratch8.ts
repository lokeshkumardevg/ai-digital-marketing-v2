import { GoogleAdsApi } from 'google-ads-api';
// We just want to check the return type of campaigns.create()
// This script won't run directly without ts-node but we can compile it
const client = new GoogleAdsApi({ client_id: '1', client_secret: '2', developer_token: '3' });
const customer = client.Customer({ customer_id: '4', refresh_token: '5' });
const run = async () => {
    const res = await customer.campaigns.create([{ name: 'test' }]);
    console.log(res);
}
