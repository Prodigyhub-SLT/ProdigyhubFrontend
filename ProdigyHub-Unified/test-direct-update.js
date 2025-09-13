#!/usr/bin/env node

/**
 * Test script to directly test the user update API with the correct userId
 */

const fetch = require('node-fetch');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function testDirectUpdate() {
  console.log('🔄 Testing Direct User Update API'.cyan);
  console.log('=' .repeat(60).gray);
  console.log(`🌐 Testing against: ${BASE_URL}`.blue);
  console.log('=' .repeat(60).gray);

  try {
    // Test with the correct userId from MongoDB
    const correctUserId = 'AEY8jsEB75fwoCXh3yoL6Z47d9O2';
    const testEmail = 'thejana.20232281@iit.ac.lk';
    
    console.log('\n📝 Test 1: Testing profile update with correct userId...'.yellow);
    console.log(`👤 User ID: ${correctUserId}`);
    console.log(`📧 Email: ${testEmail}`);
    
    const profileUpdates = {
      firstName: 'Thejana',
      lastName: 'Jayalath',
      email: testEmail,
      phoneNumber: '+94771234567',
      nic: '12345678V'
    };

    const response = await fetch(`${BASE_URL}/users/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: correctUserId,
        updates: profileUpdates
      })
    });

    console.log(`📊 Response status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Profile update successful!');
      console.log('📋 Updated user:', result.user);
    } else {
      const errorText = await response.text();
      console.log('❌ Profile update failed:');
      console.log('Error:', errorText);
    }

    // Test 2: Test address update
    console.log('\n📝 Test 2: Testing address update...'.yellow);
    
    const addressUpdates = {
      address: {
        street: '123 Test Street, Colombo 7',
        city: 'Colombo',
        district: 'Colombo',
        province: 'Western',
        postalCode: '00700'
      }
    };

    const addressResponse = await fetch(`${BASE_URL}/users/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: correctUserId,
        updates: addressUpdates
      })
    });

    console.log(`📊 Address response status: ${addressResponse.status}`);
    
    if (addressResponse.ok) {
      const addressResult = await addressResponse.json();
      console.log('✅ Address update successful!');
      console.log('📋 Updated address:', addressResult.user.address);
    } else {
      const errorText = await addressResponse.text();
      console.log('❌ Address update failed:');
      console.log('Error:', errorText);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Add colors for better output
const colors = {
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  reset: '\x1b[0m'
};

// Apply colors to console methods
console.cyan = (text) => console.log(colors.cyan + text + colors.reset);
console.yellow = (text) => console.log(colors.yellow + text + colors.reset);
console.green = (text) => console.log(colors.green + text + colors.reset);
console.red = (text) => console.log(colors.red + text + colors.reset);
console.blue = (text) => console.log(colors.blue + text + colors.reset);
console.gray = (text) => console.log(colors.gray + text + colors.reset);

// Run the test
testDirectUpdate();
