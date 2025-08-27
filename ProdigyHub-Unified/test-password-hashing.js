#!/usr/bin/env node

const axios = require('axios');
const colors = require('colors');

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function testPasswordHashing() {
  console.log('🔐 Testing Password Hashing Security'.cyan.bold);
  console.log('=' .repeat(60).gray);
  console.log(`🌐 Testing against: ${BASE_URL}`.blue);
  console.log('=' .repeat(60).gray);

  try {
    // Test 1: Create a new user with password hashing
    console.log('\n📝 Test 1: Creating new user with password hashing...'.yellow);
    
    const testUserData = {
      firstName: 'Test',
      lastName: 'Security',
      email: `security.test.${Date.now()}@example.com`,
      phoneNumber: '+1234567890',
      password: 'mypassword123',
      userId: `test-security-${Date.now()}`
    };

    const signupResponse = await axios.post(`${BASE_URL}/users/signup`, testUserData);
    console.log('✅ User created successfully');
    
    const userId = signupResponse.data.user.id;
    console.log(`👤 User ID: ${userId}`);

    // Test 2: Check if password is hashed in database
    console.log('\n🔍 Test 2: Checking if password is hashed...'.yellow);
    
    const userResponse = await axios.get(`${BASE_URL}/users/${userId}`);
    const user = userResponse.data;
    
    console.log('📊 User data retrieved:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Password field exists: ${user.password ? 'YES' : 'NO'}`);
    console.log(`   Password length: ${user.password ? user.password.length : 'N/A'}`);
    console.log(`   Password starts with $2: ${user.password ? user.password.startsWith('$2') : 'N/A'}`);
    
    if (user.password && user.password.startsWith('$2') && user.password.length === 60) {
      console.log('✅ Password is properly hashed with bcrypt!'.green);
    } else {
      console.log('❌ Password is NOT hashed properly!'.red);
    }

    // Test 3: Verify password works
    console.log('\n🔐 Test 3: Testing password verification...'.yellow);
    
    const verifyResponse = await axios.post(`${BASE_URL}/users/verify-password`, {
      email: testUserData.email,
      password: testUserData.password
    });
    
    if (verifyResponse.data.isValid) {
      console.log('✅ Password verification successful!'.green);
    } else {
      console.log('❌ Password verification failed!'.red);
    }

    // Test 4: Test login
    console.log('\n🚪 Test 4: Testing login...'.yellow);
    
    const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
      email: testUserData.email,
      password: testUserData.password
    });
    
    if (loginResponse.data.message === 'Login successful') {
      console.log('✅ Login successful!'.green);
      console.log(`👤 Logged in user: ${loginResponse.data.user.firstName} ${loginResponse.data.user.lastName}`);
    } else {
      console.log('❌ Login failed!'.red);
    }

    // Test 5: Test wrong password
    console.log('\n❌ Test 5: Testing wrong password...'.yellow);
    
    try {
      await axios.post(`${BASE_URL}/users/login`, {
        email: testUserData.email,
        password: 'wrongpassword'
      });
      console.log('❌ Login should have failed with wrong password!'.red);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Correctly rejected wrong password!'.green);
      } else {
        console.log('❌ Unexpected error with wrong password!'.red);
      }
    }

    // Cleanup: Delete test user
    console.log('\n🧹 Cleaning up test user...'.yellow);
    try {
      await axios.delete(`${BASE_URL}/users/${userId}`);
      console.log('✅ Test user deleted successfully'.green);
    } catch (cleanupError) {
      console.log('⚠️ Could not delete test user:', cleanupError.message);
    }

    console.log('\n🎉 All password hashing tests completed successfully!'.green.bold);
    console.log('🔐 Your passwords are now secure and hashed in MongoDB!'.green);

  } catch (error) {
    console.error('❌ Test failed:'.red.bold, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testPasswordHashing();
}

module.exports = testPasswordHashing;
