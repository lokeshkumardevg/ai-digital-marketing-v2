const { GoogleAdsApi } = require('google-ads-api');
require('dotenv').config();

async function test() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const developerToken = process.env.GOOGLE_DEVELOPER_TOKEN;
  const mccId = process.env.SYSTEM_GOOGLE_MCC_ID.replace(/-/g, '');
  const refreshToken = process.env.SYSTEM_GOOGLE_REFRESH_TOKEN;

  console.log('Testing with MCC ID:', mccId);
  
  const clientAuth = new GoogleAdsApi({
    client_id: clientId,
    client_secret: clientSecret,
    developer_token: developerToken,
  });

  const mccCustomer = clientAuth.Customer({
    customer_id: mccId,
    login_customer_id: mccId,
    refresh_token: refreshToken,
  });

  try {
    console.log('Attempting to create a client account...');
    const result = await mccCustomer.customers.createCustomerClient({
      customer_id: mccId,
      customer_client: {
        descriptive_name: `Wheedle Test Client`,
        currency_code: 'INR',
        time_zone: 'Asia/Calcutta',
      }
    });
    console.log('Success!', result);

    const newCustomerId = result.resource_name.split('/')[1];
    console.log('Now testing access to new client account:', newCustomerId);

    const workingCustomer = clientAuth.Customer({
      customer_id: newCustomerId,
      login_customer_id: mccId,
      refresh_token: refreshToken,
    });

    console.log('Attempting to create budget...');
    const budgetResult = await workingCustomer.campaignBudgets.create([
      {
        name: `Test Budget - ${Date.now()}`,
        amount_micros: 10000000,
        delivery_method: 2, // STANDARD
      }
    ]);
    console.log('Budget Success!', budgetResult);

  } catch (error) {
    console.error('API Error:');
    if (error.errors && error.errors.length > 0) {
      console.error(error.errors[0].message);
    } else {
      console.error(error.message || error);
    }
  }
}

test();
