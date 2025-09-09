#!/usr/bin/env node

/**
 * Test script to verify direct user address update is working
 */

const mongoose = require('mongoose');
const { User } = require('./src/models/AllTMFModels');

// MongoDB connection
const connectToMongoDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/prodigyhub';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

// Test function
const testDirectUserUpdate = async () => {
  try {
    console.log('🔄 Testing direct user address update...');
    
    // Find the test user
    const user = await User.findOne({ email: 'thejana.20232281@iit.ac.lk' });
    if (!user) {
      console.log('❌ User not found: thejana.20232281@iit.ac.lk');
      return;
    }
    
    console.log('✅ Found user:', {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      currentAddress: user.address
    });
    
    // Test address update
    const testAddress = {
      street: '123 Test Street, Colombo',
      city: 'Colombo',
      district: 'Colombo',
      province: 'Western',
      postalCode: '00100'
    };
    
    console.log('🔄 Updating user address...');
    
    const updatedUser = await User.findOneAndUpdate(
      { email: 'thejana.20232281@iit.ac.lk' },
      { 
        address: testAddress,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).select('-__v');
    
    if (updatedUser) {
      console.log('✅ User address updated successfully!');
      console.log('📋 Updated address:', updatedUser.address);
      
      if (updatedUser.address && updatedUser.address.district === 'Colombo') {
        console.log('🎉 SUCCESS: Address was properly updated in user collection!');
      } else {
        console.log('❌ FAILED: Address was not updated properly');
      }
    } else {
      console.log('❌ Failed to update user address');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
const main = async () => {
  await connectToMongoDB();
  await testDirectUserUpdate();
  
  console.log('\n🏁 Direct user update test completed');
  process.exit(0);
};

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
  });
}

module.exports = { testDirectUserUpdate };
