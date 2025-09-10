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

async function manualSyncRecentUser() {
  try {
    console.log('🔄 Manually syncing address for recent user...');
    
    // Step 1: Find the user by email
    console.log('1. Finding user by email...');
    const userResponse = await makeRequest(`${API_BASE}/api/users/email/thejanajayalath2003@gmail.com`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (userResponse.status !== 200) {
      console.log('❌ User not found:', userResponse.data);
      return;
    }
    
    const user = userResponse.data;
    console.log('✅ User found:', user.email);
    console.log('Current address:', user.address);
    
    // Step 2: Update user with address from qualification
    console.log('\n2. Updating user with address from qualification...');
    const addressData = {
      street: 'Colombo 7 , Bambalapitiya',
      city: 'colombo',
      district: 'Colombo',
      province: 'Western',
      postalCode: '2020'
    };
    
    const updateResponse = await makeRequest(`${API_BASE}/api/users/${user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...user,
        address: addressData,
        updatedAt: new Date().toISOString()
      })
    });
    
    if (updateResponse.status === 200) {
      console.log('✅ User address updated successfully!');
      console.log('New address:', JSON.stringify(updateResponse.data.address, null, 2));
    } else {
      console.log('❌ Failed to update user address:', updateResponse.data);
    }
    
    // Step 3: Verify the update
    console.log('\n3. Verifying update...');
    const verifyResponse = await makeRequest(`${API_BASE}/api/users/email/thejanajayalath2003@gmail.com`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (verifyResponse.status === 200) {
      const updatedUser = verifyResponse.data;
      console.log('✅ Verification successful!');
      console.log('Updated address:', JSON.stringify(updatedUser.address, null, 2));
    } else {
      console.log('❌ Verification failed:', verifyResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Error syncing user address:', error);
  }
}

// Run the sync
manualSyncRecentUser();
