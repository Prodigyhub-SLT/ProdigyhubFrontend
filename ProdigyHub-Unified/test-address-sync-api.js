const https = require('https');

const API_BASE = 'https://sltprodigyhub.vercel.app';

// Function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testAddressSyncAPI() {
  try {
    console.log('🔍 Testing address sync API...');
    
    // Test the correct endpoint
    const syncResponse = await makeRequest(`${API_BASE}/api/sync-addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Sync API Response Status:', syncResponse.status);
    console.log('Sync API Response:', JSON.stringify(syncResponse.data, null, 2));
    
    // Check user address after sync
    console.log('\n🔍 Checking user address after sync...');
    const userResponse = await makeRequest(`${API_BASE}/api/users/email/thejanajayalath2003@gmail.com`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (userResponse.status === 200) {
      console.log('✅ User found:', userResponse.data.email);
      console.log('User address:', JSON.stringify(userResponse.data.address, null, 2));
    } else {
      console.log('❌ User not found:', userResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Error testing address sync API:', error);
  }
}

// Run the test
testAddressSyncAPI();
