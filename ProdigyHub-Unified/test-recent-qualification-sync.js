const https = require('https');

const API_BASE = 'https://sltprodigyhub.vercel.app/api';

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

async function testRecentQualificationSync() {
  try {
    console.log('🔍 Testing recent qualification sync...');
    
    // Step 1: Get recent qualifications
    console.log('1. Getting recent qualifications...');
    const qualsResponse = await makeRequest(`${API_BASE}/productOfferingQualification/v5/checkProductOfferingQualification`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (qualsResponse.status !== 200) {
      console.log('❌ Failed to get qualifications:', qualsResponse.data);
      return;
    }
    
    const qualifications = qualsResponse.data;
    console.log(`✅ Found ${qualifications.length} qualifications`);
    
    // Find the most recent qualification
    const recentQual = qualifications[0];
    console.log('Recent qualification:', {
      id: recentQual.id,
      description: recentQual.description,
      relatedParty: recentQual.relatedParty
    });
    
    // Check if it has SLT_LOCATION note
    const locationNote = recentQual.note?.find(n => n.text?.startsWith('SLT_LOCATION:'));
    if (locationNote) {
      console.log('SLT_LOCATION note:', locationNote.text);
    } else {
      console.log('❌ No SLT_LOCATION note found');
    }
    
    // Step 2: Test address sync API
    console.log('\n2. Testing address sync API...');
    const syncResponse = await makeRequest(`${API_BASE}/sync-addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (syncResponse.status === 200) {
      console.log('✅ Address sync API response:', syncResponse.data);
    } else {
      console.log('❌ Address sync API failed:', syncResponse.data);
    }
    
    // Step 3: Check user address after sync
    console.log('\n3. Checking user address after sync...');
    const userEmail = recentQual.relatedParty?.[0]?.email;
    if (userEmail) {
      const userResponse = await makeRequest(`${API_BASE}/users/email/${encodeURIComponent(userEmail)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (userResponse.status === 200) {
        console.log('✅ User found:', userResponse.data.email);
        console.log('User address:', userResponse.data.address);
      } else {
        console.log('❌ User not found:', userResponse.data);
      }
    } else {
      console.log('❌ No user email found in qualification');
    }
    
  } catch (error) {
    console.error('❌ Error testing qualification sync:', error);
  }
}

// Run the test
testRecentQualificationSync();
