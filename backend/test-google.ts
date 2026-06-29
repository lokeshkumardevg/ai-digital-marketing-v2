import { GoogleAdsApi } from 'google-ads-api';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  try {
    const clientAuth = new GoogleAdsApi({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      developer_token: process.env.GOOGLE_DEVELOPER_TOKEN || '',
    });

    const mccId = (process.env.SYSTEM_GOOGLE_MCC_ID || '').replace(/-/g, '');
    const refresh_token = process.env.SYSTEM_GOOGLE_REFRESH_TOKEN || '';
    
    console.log('Connecting to MCC:', mccId);

    const targetCustomerId = process.env.SYSTEM_GOOGLE_CUSTOMER_ID || '';
    if (targetCustomerId) {
      console.log('Connecting directly to Customer:', targetCustomerId);
      const childCustomer = clientAuth.Customer({
        customer_id: targetCustomerId.replace(/-/g, ''),
        login_customer_id: mccId,
        refresh_token: refresh_token,
      });

      console.log('Fetching campaigns...');
      const campaigns = await childCustomer.query(`
        SELECT campaign.id, campaign.status, campaign.name, campaign_budget.amount_micros, metrics.cost_micros, metrics.impressions, metrics.clicks
        FROM campaign
        WHERE campaign.status IN ('ENABLED', 'PAUSED')
      `);
      console.log('Campaigns found:', campaigns.length);
      console.log(JSON.stringify(campaigns, null, 2));
    } else {
      console.log('No SYSTEM_GOOGLE_CUSTOMER_ID provided.');
    }
    
  } catch (err: any) {
    console.error('ERROR OCCURRED:');
    if (err.errors) {
      console.error(JSON.stringify(err.errors, null, 2));
    } else {
      console.error(err);
    }
  }
}

run();
