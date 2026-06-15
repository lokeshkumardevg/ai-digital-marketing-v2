const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/ai_digital');
  const db = mongoose.connection.db;

  // Find a user with a linkedin token
  const user = await db.collection('users').findOne({ linkedinAccessToken: { $exists: true, $ne: null } });
  if (!user) {
    console.log("No user found with linkedinAccessToken");
    process.exit(1);
  }

  console.log(`Testing with User: ${user.name || user.email}`);
  const token = user.linkedinAccessToken;

  try {
    // 1. Fetch Ad Accounts
    console.log("--- 1. Fetching Ad Accounts ---");
    const adAccRes = await fetch('https://api.linkedin.com/v2/adAccountsV2?q=search&count=5', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202605',
      }
    });
    
    if (!adAccRes.ok) throw new Error(await adAccRes.text());
    const adAccData = await adAccRes.json();
    let adAccount = adAccData.elements?.[0];

    if (!adAccount) {
        console.log("No Ad Account found, attempting to auto-provision...");
        const orgId = user.linkedinOrganizations?.[0]?.urn || 'urn:li:organization:118094246'; // fallback to user org
        const createAccRes = await fetch('https://api.linkedin.com/v2/adAccountsV2', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'X-Restli-Protocol-Version': '2.0.0',
              'LinkedIn-Version': '202605',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              reference: orgId,
              type: 'BUSINESS',
              name: `Wheedle Ad Account - Test`,
              currency: 'USD'
            })
          });
          if (!createAccRes.ok) throw new Error("Auto provision failed: " + await createAccRes.text());
          const newAccId = createAccRes.headers.get('x-restli-id');
          adAccount = { id: newAccId };
          console.log("Created Ad Account:", newAccId);
    } else {
        console.log(`Found Ad Account: ${adAccount.id} (Status: ${adAccount.status})`);
    }

    // 2. Search Campaign Group
    console.log("\n--- 2. Fetching Campaign Group ---");
    const groupSearchUrl = `https://api.linkedin.com/rest/adAccounts/${adAccount.id}/adCampaignGroups?q=search&count=1`;
    console.log(`URL: ${groupSearchUrl}`);
    const groupSearchRes = await fetch(groupSearchUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'LinkedIn-Version': '202605',
          'X-Restli-Protocol-Version': '2.0.0',
        }
    });
    
    let campaignGroupUrn = '';
    if (groupSearchRes.ok) {
        const groupData = await groupSearchRes.json();
        if (groupData.elements?.length > 0) {
            campaignGroupUrn = groupData.elements[0].id || `urn:li:sponsoredCampaignGroup:${groupData.elements[0].id}`;
            console.log("Found existing campaign group:", campaignGroupUrn);
        } else {
            console.log("No existing campaign group found.");
        }
    } else {
        console.log("Group Search Failed:", await groupSearchRes.text());
    }

    if (!campaignGroupUrn) {
        console.log("\n--- 3. Creating Campaign Group ---");
        const createGroupUrl = `https://api.linkedin.com/rest/adAccounts/${adAccount.id}/adCampaignGroups`;
        console.log(`POST ${createGroupUrl}`);
        const createGroupRes = await fetch(createGroupUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'LinkedIn-Version': '202605',
              'X-Restli-Protocol-Version': '2.0.0',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              account: `urn:li:sponsoredAccount:${adAccount.id}`,
              name: 'AI Generated Campaign Group Test ' + Date.now(),
              status: 'ACTIVE',
              runSchedule: {
                start: Date.now()
              }
            })
        });

        if (!createGroupRes.ok) throw new Error("Create Group Failed: " + await createGroupRes.text());
        const locationHeader = createGroupRes.headers.get('x-restli-id');
        campaignGroupUrn = `urn:li:sponsoredCampaignGroup:${locationHeader}`;
        console.log("Created Campaign Group:", campaignGroupUrn);
    }

  } catch (e) {
    console.error("\n[!] ERROR:");
    console.error(e.message);
  } finally {
    mongoose.disconnect();
  }
}

run();
