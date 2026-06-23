import axios from 'axios';

async function verifyToken() {
  const token = 'AQVOK9Tn_bYTgVa5teZWpYjmc2l4YbGwZ2uQfCofTwmgKJ1zDhIpS5RV2rAOPfJrtlXAu9M9dIeiynLgJcwGUER9nOZETHJKWvEs-QwERwvTELbSPnA9w2bF92l2io530KmWbwOKFe_3wil0iDhqz2mMsnk2UjCdHoAHCBOgGcfZaEABV9f7KrcEKLhPvOkKn2lNrGffmG445p0kzE9R8VY5DgiNSmxreQymVw5WPOBPFkyxTxv5R5SsgwZxA3aopd5ljBxk-PU16mZxogRQFUWBdx8NZgueElsl47JXfqnGhmxzqIFUo7jwZD4spSoSj07MqKrVdrTbvCkwYm0kS1vbPT-7_Q';
  try {
    const res = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('User info successful. Token is valid.');
    
    // Check if we can fetch ad accounts
    try {
      const adsRes = await axios.get('https://api.linkedin.com/v2/adAccountsV2?q=search&search.type.values[0]=BUSINESS&search.status.values[0]=ACTIVE&count=10', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      console.log('Ad accounts found:', adsRes.data);
    } catch (e) {
      console.error('Cannot access ad accounts:', e.response?.data || e.message);
    }
  } catch (error) {
    console.error('Error fetching user info:', error.response?.data || error.message);
  }
}

verifyToken();
