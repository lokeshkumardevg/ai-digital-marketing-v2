const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const axios = require('axios');

const uri = 'mongodb+srv://devclientg:SCpLNaejWusV7mcR@cluster0.vyinynw.mongodb.net/ai_digital?retryWrites=true&w=majority';

async function test() {
  await mongoose.connect(uri);
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  
  // 1. Reset test@example.com password to password123
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('password123', salt);
  await User.updateOne({ email: 'test@example.com' }, { $set: { passwordHash: hash } });
  console.log('Superadmin password reset done.');

  // 2. Perform Login via HTTP
  try {
    const loginRes = await axios.post('http://localhost:3000/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    const token = loginRes.data.access_token;
    console.log('Login successful. Token acquired.');

    // 3. Perform patch user role to 'agency'
    const targetUserId = '69e495adc50a308fab62f916'; // Test User (test_dashboard@example.com)
    console.log(`Sending patch request to /users/${targetUserId}...`);
    
    const patchRes = await axios.patch(`http://localhost:3000/users/${targetUserId}`, {
      role: 'agency',
      permissions: ['dashboard', 'ads', 'content']
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Patch success! Response data:', patchRes.data);
  } catch (err) {
    if (err.response) {
      console.error('API Error Response:', err.response.status, err.response.data);
    } else {
      console.error('Network Error:', err.message);
    }
  }

  process.exit(0);
}

test().catch(console.error);
