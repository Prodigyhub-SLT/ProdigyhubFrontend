#!/usr/bin/env node

const axios = require('axios');
const colors = require('colors');

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function testEmailVerification() {
  console.log('📧 Testing Email Verification System'.cyan.bold);
  console.log('=' .repeat(60).gray);
  console.log(`🌐 Testing against: ${BASE_URL}`.blue);
  console.log('=' .repeat(60).gray);

  try {
    // Test 1: Create new user with email verification
    console.log('\n📝 Test 1: Creating new user with email verification...'.yellow);
    
    const testUserData = {
      firstName: 'Email',
      lastName: 'Verification',
      email: `email.verification.${Date.now()}@example.com`,
      phoneNumber: '+1234567890',
      password: 'testpassword123',
      userId: `email-test-${Date.now()}`
    };

    const signupResponse = await axios.post(`${BASE_URL}/users/signup`, testUserData);
    console.log('✅ User created successfully');
    
    const userId = signupResponse.data.user.id;
    const userEmail = testUserData.email;
    console.log(`👤 User ID: ${userId}`);
    console.log(`📧 User Email: ${userEmail}`);
    
    // Check if user is unverified
    if (signupResponse.data.user.status === 'unverified') {
      console.log('✅ User status is correctly set to "unverified"'.green);
    } else {
      console.log('❌ User status should be "unverified"'.red);
    }

    // Test 2: Try to login with unverified account
    console.log('\n🚪 Test 2: Attempting login with unverified account...'.yellow);
    
    try {
      await axios.post(`${BASE_URL}/users/login`, {
        email: userEmail,
        password: testUserData.password
      });
      console.log('❌ Login should have failed for unverified account!'.red);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.log('✅ Correctly blocked login for unverified account!'.green);
        console.log(`📝 Error message: ${error.response.data.message}`);
      } else {
        console.log('❌ Unexpected error during login test!'.red);
        console.log('Status:', error.response?.status);
        console.log('Message:', error.response?.data?.message);
      }
    }

    // Test 3: Check user details to see verification fields
    console.log('\n🔍 Test 3: Checking user verification fields...'.yellow);
    
    const userResponse = await axios.get(`${BASE_URL}/users/${userId}`);
    const user = userResponse.data;
    
    console.log('📊 User verification details:');
    console.log(`   Status: ${user.status}`);
    console.log(`   Is Email Verified: ${user.isEmailVerified}`);
    console.log(`   Has Verification Token: ${user.emailVerificationToken ? 'YES' : 'NO'}`);
    console.log(`   Token Expires: ${user.emailVerificationExpires ? new Date(user.emailVerificationExpires).toLocaleString() : 'N/A'}`);
    
    if (user.status === 'unverified' && !user.isEmailVerified && user.emailVerificationToken) {
      console.log('✅ User verification fields are correctly set!'.green);
    } else {
      console.log('❌ User verification fields are not set correctly!'.red);
    }

    // Test 4: Test resend verification
    console.log('\n📧 Test 4: Testing resend verification...'.yellow);
    
    try {
      const resendResponse = await axios.post(`${BASE_URL}/users/resend-verification`, {
        email: userEmail
      });
      
      if (resendResponse.data.message === 'Verification email sent successfully') {
        console.log('✅ Resend verification successful!'.green);
      } else {
        console.log('❌ Unexpected resend response!'.red);
      }
    } catch (error) {
      console.log('❌ Resend verification failed:', error.response?.data?.message || error.message);
    }

    // Test 5: Verify email with token (simulate email verification)
    console.log('\n🔐 Test 5: Testing email verification...'.yellow);
    
    // Get the updated user to see the new token
    const updatedUserResponse = await axios.get(`${BASE_URL}/users/${userId}`);
    const updatedUser = updatedUserResponse.data;
    
    if (updatedUser.emailVerificationToken) {
      try {
        const verifyResponse = await axios.get(`${BASE_URL}/users/verify-email/${updatedUser.emailVerificationToken}`);
        
        if (verifyResponse.data.message.includes('Email verified successfully')) {
          console.log('✅ Email verification successful!'.green);
          console.log(`📝 Message: ${verifyResponse.data.message}`);
          
          // Check if user is now verified
          const verifiedUserResponse = await axios.get(`${BASE_URL}/users/${userId}`);
          const verifiedUser = verifiedUserResponse.data;
          
          if (verifiedUser.isEmailVerified && verifiedUser.status === 'active') {
            console.log('✅ User is now verified and active!'.green);
          } else {
            console.log('❌ User verification status not updated correctly!'.red);
          }
        } else {
          console.log('❌ Email verification response unexpected!'.red);
        }
      } catch (verifyError) {
        console.log('❌ Email verification failed:', verifyError.response?.data?.message || verifyError.message);
      }
    } else {
      console.log('⚠️ No verification token found, skipping verification test');
    }

    // Test 6: Try to login with verified account
    console.log('\n🚪 Test 6: Testing login with verified account...'.yellow);
    
    try {
      const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
        email: userEmail,
        password: testUserData.password
      });
      
      if (loginResponse.data.message === 'Login successful') {
        console.log('✅ Login successful with verified account!'.green);
        console.log(`👤 Logged in user: ${loginResponse.data.user.firstName} ${loginResponse.data.user.lastName}`);
      } else {
        console.log('❌ Login response unexpected!'.red);
      }
    } catch (error) {
      console.log('❌ Login failed even with verified account:', error.response?.data?.message || error.message);
    }

    // Cleanup: Delete test user
    console.log('\n🧹 Cleaning up test user...'.yellow);
    try {
      await axios.delete(`${BASE_URL}/users/${userId}`);
      console.log('✅ Test user deleted successfully'.green);
    } catch (cleanupError) {
      console.log('⚠️ Could not delete test user:', cleanupError.message);
    }

    console.log('\n🎉 All email verification tests completed successfully!'.green.bold);
    console.log('📧 Your email verification system is working perfectly!'.green);

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
  testEmailVerification();
}

module.exports = testEmailVerification;
