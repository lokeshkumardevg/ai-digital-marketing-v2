const axios = require("axios");
require("dotenv").config();

const apiKey = process.env.SEMRUSH_API_KEY;
const domain = "google.com";
const database = "us";

async function test() {
  if (!apiKey) {
    console.error("SEMRUSH_API_KEY .env file में नहीं मिली");
    process.exit(1);
  }

  console.log("--------------------------------------------------");
  console.log("Semrush API Diagnostics");
  console.log("Key:", `${apiKey.substring(0, 15)}...${apiKey.slice(-4)}`);
  console.log("--------------------------------------------------");

  // Test 1: Semrush SEO v3 (domain_ranks)
  console.log("\n[Test 1] Testing legacy v3 API (domain_ranks)...");
  try {
    const response = await axios.get("https://api.semrush.com/", {
      params: {
        key: apiKey,
        type: "domain_ranks",
        domain,
        database,
        export_columns: "Dn,Rk,Or,Ot,Oc,Ad,At,Ac",
      },
    });
    console.log("✅ Success!");
    console.log("Data:", String(response.data).substring(0, 150));
  } catch (error) {
    console.log("❌ Failed.");
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Error Response: ${typeof error.response.data === 'object' ? JSON.stringify(error.response.data) : String(error.response.data).substring(0, 150)}`);
    } else {
      console.log("Error:", error.message);
    }
  }

  // Test 2: Semrush v4 Backlinks
  console.log("\n[Test 2] Testing v4 API (backlinks list)...");
  try {
    const response = await axios.get("https://api.semrush.com/apis/v4/backlinks/v1/links", {
      params: {
        url: domain,
        scope: "ROOT_DOMAIN",
        fields: "domain_score",
        limit: 1,
      },
      headers: {
        Authorization: `Apikey ${apiKey}`
      }
    });
    console.log("✅ Success!");
    console.log("Data:", JSON.stringify(response.data));
  } catch (error) {
    console.log("❌ Failed.");
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Error Response: ${typeof error.response.data === 'object' ? JSON.stringify(error.response.data) : String(error.response.data).substring(0, 150)}`);
    } else {
      console.log("Error:", error.message);
    }
  }

  console.log("\n--------------------------------------------------");
}

test();