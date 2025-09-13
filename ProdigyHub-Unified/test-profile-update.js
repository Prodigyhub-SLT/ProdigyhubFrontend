#!/usr/bin/env node

/**
 * Test script to verify the profile update functionality
 * Tests both profile details and address updates
 */

const fetch = require('node-fetch');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function testProfileUpdate() {
  console.log('🔄 Testing Profile Update Functionality'.cyan);
  console.log('=' .repeat(60).gray);
  console.log(`🌐 Testing against: ${BASE_URL}`.blue);
  console.log('=' .repeat(60).gray);

  try {
    // Test 1: Create a test user first
    console.log('\n📝 Test 1: Creating test user...'.yellow);
    
    const testUserData = {
      firstName: 'Test',
      lastName: 'User',
      email: `test.profile.${Date.now()}@example.com`,
      phoneNumber: '+1234567890',
      nic: '123456789V',
      password: 'testpassword123',
      userId: `test-profile-${Date.now()}`
    };

    const signupResponse = await fetch(`${BASE_URL}/users/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUserData)
    });

    if (!signupResponse.ok) {
      const errorText = await signupResponse.text();
      console.log('❌ Failed to create test user:', errorText);
      return;
    }

    const signupData = await signupResponse.json();
    const userId = signupData.user.userId || signupData.user.id;
    console.log('✅ Test user created successfully');
    console.log(`👤 User ID: ${userId}`);

    // Test 2: Update profile details
    console.log('\n📝 Test 2: Updating profile details...'.yellow);
    
    const profileUpdates = {
      firstName: 'Updated',
      lastName: 'Profile',
      email: testUserData.email, // Keep same email
      phoneNumber: '+9876543210',
      nic: '987654321V'
    };

    const profileResponse = await fetch(`${BASE_URL}/users/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        updates: profileUpdates
      })
    });

    if (profileResponse.ok) {
      const profileResult = await profileResponse.json();
      console.log('✅ Profile details updated successfully');
      console.log('📋 Updated profile:', profileResult.user);
      
      // Verify the updates
      if (profileResult.user.firstName === 'Updated' && 
          profileResult.user.lastName === 'Profile' &&
          profileResult.user.phoneNumber === '+9876543210') {
        console.log('🎉 SUCCESS: Profile details were properly updated!');
      } else {
        console.log('❌ FAILED: Profile details were not updated correctly');
      }
    } else {
      const errorText = await profileResponse.text();
      console.log('❌ Profile update failed:', errorText);
    }

    // Test 3: Update address details
    console.log('\n📝 Test 3: Updating address details...'.yellow);
    
    const addressUpdates = {
      address: {
        street: '123 Test Street, Colombo',
        city: 'Colombo',
        district: 'Colombo',
        province: 'Western',
        postalCode: '00100'
      }
    };

    const addressResponse = await fetch(`${BASE_URL}/users/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        updates: addressUpdates
      })
    });

    if (addressResponse.ok) {
      const addressResult = await addressResponse.json();
      console.log('✅ Address details updated successfully');
      console.log('📋 Updated address:', addressResult.user.address);
      
      // Verify the address updates
      if (addressResult.user.address && 
          addressResult.user.address.district === 'Colombo' &&
          addressResult.user.address.province === 'Western') {
        console.log('🎉 SUCCESS: Address details were properly updated!');
      } else {
        console.log('❌ FAILED: Address details were not updated correctly');
      }
    } else {
      const errorText = await addressResponse.text();
      console.log('❌ Address update failed:', errorText);
    }

    // Test 4: Verify persistence by fetching user again
    console.log('\n📝 Test 4: Verifying persistence...'.yellow);
    
    const verifyResponse = await fetch(`${BASE_URL}/users/profile/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      console.log('✅ User data retrieved successfully');
      console.log('📋 Current profile:', {
        firstName: verifyData.user.firstName,
        lastName: verifyData.user.lastName,
        phoneNumber: verifyData.user.phoneNumber,
        address: verifyData.user.address
      });
      
      // Final verification
      if (verifyData.user.firstName === 'Updated' && 
          verifyData.user.address && 
          verifyData.user.address.district === 'Colombo') {
        console.log('🎉 FINAL SUCCESS: All updates persisted correctly!');
      } else {
        console.log('❌ FINAL FAILED: Updates did not persist correctly');
      }
    } else {
      const errorText = await verifyResponse.text();
      console.log('❌ Failed to verify user data:', errorText);
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
testProfileUpdate();
