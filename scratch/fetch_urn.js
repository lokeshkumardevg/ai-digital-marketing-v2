import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

async function fetchUrn() {
  const token = 'AQVOK9Tn_bYTgVa5teZWpYjmc2l4YbGwZ2uQfCofTwmgKJ1zDhIpS5RV2rAOPfJrtlXAu9M9dIeiynLgJcwGUER9nOZETHJKWvEs-QwERwvTELbSPnA9w2bF92l2io530KmWbwOKFe_3wil0iDhqz2mMsnk2UjCdHoAHCBOgGcfZaEABV9f7KrcEKLhPvOkKn2lNrGffmG445p0kzE9R8VY5DgiNSmxreQymVw5WPOBPFkyxTxv5R5SsgwZxA3aopd5ljBxk-PU16mZxogRQFUWBdx8NZgueElsl47JXfqnGhmxzqIFUo7jwZD4spSoSj07MqKrVdrTbvCkwYm0kS1vbPT-7_Q';
  try {
    const res = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const urn = `urn:li:person:${res.data.sub}`;
    console.log(`Fetched URN: ${urn}`);
    
    const envPath = path.join(__dirname, '../../backend/.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    if (envContent.includes('LINKEDIN_URN=')) {
      envContent = envContent.replace(/LINKEDIN_URN=.*/, `LINKEDIN_URN=${urn}`);
    } else {
      envContent = envContent.replace(/LINKEDIN_ACCESS_TOKEN=(.*)/, `LINKEDIN_ACCESS_TOKEN=$1\nLINKEDIN_URN=${urn}`);
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('Successfully updated .env with LINKEDIN_URN');
  } catch (error) {
    console.error('Error fetching user info:', error.response?.data || error.message);
  }
}

fetchUrn();
