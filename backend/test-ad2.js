const { GoogleAdsApi, enums } = require('google-ads-api');

// Fetching config from actual .env file to get correct client_id/secret
require('dotenv').config({ path: '.env' });

async function testAd() {
  const clientAuth = new GoogleAdsApi({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    developer_token: process.env.GOOGLE_DEVELOPER_TOKEN || 'lcZ3RRE00HWy2i4quLMNuQ'
  });

  const customerId = '8796086644';
  const loginCustomerId = '5901462899';
  const workingRefreshToken = process.env.SYSTEM_GOOGLE_REFRESH_TOKEN; 

  const workingCustomer = clientAuth.Customer({
    customer_id: customerId,
    login_customer_id: loginCustomerId,
    refresh_token: workingRefreshToken
  });

  try {
    const adGroups = await workingCustomer.query(`
      SELECT ad_group.id, ad_group.resource_name, campaign.id, campaign.resource_name 
      FROM ad_group 
      ORDER BY ad_group.id DESC 
      LIMIT 1
    `);

    if (!adGroups.length) {
      console.log("No ad groups found to attach ad to.");
      return;
    }
    const adGroupResourceName = adGroups[0].ad_group.resource_name;
    console.log("Using AdGroup:", adGroupResourceName);

    const adGroupAdResult = await workingCustomer.adGroupAds.create([
      {
        ad_group: adGroupResourceName,
        status: enums.AdGroupAdStatus.PAUSED,
        ad: {
          final_urls: ['https://www.wheedletechnologies.tech'],
          responsive_search_ad: {
            headlines: [
              { text: 'Amazing Offer - ' + Date.now().toString().slice(-4) },
              { text: 'Buy Now Today' },
              { text: 'Limited Time Deal' }
            ],
            descriptions: [
              { text: 'Get the best deals today. Click to learn more.' },
              { text: 'Sign up today and get an exclusive discount on your purchase.' }
            ]
          }
        }
      }
    ]);
    console.log("Success!", JSON.stringify(adGroupAdResult, null, 2));

  } catch (err) {
    console.error("Failed to create Ad:");
    if (err.errors) {
      console.error(JSON.stringify(err.errors, null, 2));
    } else {
      console.error(err);
    }
  }
}
testAd();
