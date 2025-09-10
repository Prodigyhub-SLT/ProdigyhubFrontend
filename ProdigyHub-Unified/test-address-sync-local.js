const fetch = require('node-fetch');

const API_BASE = 'https://sltprodigyhub.vercel.app/api';

async function testAddressSync() {
  try {
    console.log('🔄 Testing Address Sync API...\n');

    // Test 1: Check sync status
    console.log('1. Checking sync status...');
    try {
      const statusResponse = await fetch(`${API_BASE}/sync-addresses/status`);
      const statusData = await statusResponse.json();
      console.log('✅ Status response:', JSON.stringify(statusData, null, 2));
    } catch (error) {
      console.log('❌ Status check failed:', error.message);
    }

    // Test 2: Sync addresses
    console.log('\n2. Syncing addresses...');
    try {
      const syncResponse = await fetch(`${API_BASE}/sync-addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const syncData = await syncResponse.json();
      console.log('✅ Sync response:', JSON.stringify(syncData, null, 2));
    } catch (error) {
      console.log('❌ Sync failed:', error.message);
    }

    // Test 3: Get users
    console.log('\n3. Getting users...');
    try {
      const usersResponse = await fetch(`${API_BASE}/users`);
      const usersData = await usersResponse.json();
      
      const usersWithAddress = usersData.filter(user => user.address && user.address.district);
      console.log(`✅ Found ${usersData.length} total users, ${usersWithAddress.length} with addresses`);
      
      if (usersWithAddress.length > 0) {
        console.log('Users with addresses:');
        usersWithAddress.forEach(user => {
          console.log(`  - ${user.email}: ${user.address.district}, ${user.address.province}`);
        });
      }
    } catch (error) {
      console.log('❌ Get users failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAddressSync();

