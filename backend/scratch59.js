const fetch = require('node-fetch');

async function run() {
  const body = {
    brandName: 'Wheedletechnologies',
    website: 'https://wheedletechnologies.com',
    industryHint: 'Technology',
    scrapedTitle: 'Wheedle Technologies',
    scrapedMetaDesc: 'Growth marketing and tech solutions.',
    scrapedContent: 'Wheedle Technologies provides expert digital marketing, branding, web development, SEO, and social media solutions to accelerate business growth.',
  };

  try {
    console.log('Sending request to Python server at http://localhost:8003/api/v1/discover-brand ...');
    const res = await fetch('http://localhost:8003/api/v1/discover-brand', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    console.log('Response Status:', res.status);
    const json = await res.json();
    console.log('Response JSON:', JSON.stringify(json, null, 2));
  } catch (err) {
    console.error('Error calling Python server:', err.message);
  }
}
run();
