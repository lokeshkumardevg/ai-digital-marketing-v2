const http = require('http');

const data = JSON.stringify({
  userId: "12345",
  campaignId: "google_1740995966580",
  name: "Test Campaign",
  platform: "google",
  data: { test: 1 }
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/campaign/draft',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', body));
});

req.on('error', error => console.error('Error:', error));
req.write(data);
req.end();
