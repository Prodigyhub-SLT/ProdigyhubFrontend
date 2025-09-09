#!/usr/bin/env node

/**
 * Test script to verify address sync is working
 * This creates a test qualification and checks if address syncs to user
 */

const mongoose = require('mongoose');
const { CheckProductOfferingQualification, User } = require('./src/models/AllTMFModels');
const { syncAddressToUser } = require('./src/api/tmf679/utils/addressSyncUtils');

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
const testAddressSync = async () => {
  try {
    console.log('🔄 Testing address sync functionality...');
    
    // Create a test user first
    const testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phoneNumber: '0771234567',
      nic: '123456789V',
      password: 'hashedpassword',
      status: 'active'
    });
    
    const savedUser = await testUser.save();
    console.log(`✅ Created test user: ${savedUser.email}`);
    
    // Create a test qualification with address
    const testQualification = new CheckProductOfferingQualification({
      description: 'Test qualification for address sync',
      state: 'acknowledged',
      note: [
        {
          text: 'SLT_LOCATION:{"address":"123 Test Street, Colombo","district":"Colombo","province":"Western","postalCode":"00100"}',
          author: 'Test System',
          date: new Date().toISOString(),
          '@type': 'Note'
        }
      ],
      relatedParty: [{
        id: savedUser.id,
        name: `${savedUser.firstName} ${savedUser.lastName}`,
        email: savedUser.email,
        role: 'customer',
        '@type': 'RelatedPartyRefOrPartyRoleRef'
      }]
    });
    
    const savedQualification = await testQualification.save();
    console.log(`✅ Created test qualification: ${savedQualification.id}`);
    
    // Test address sync
    console.log('🔄 Testing address sync...');
    const syncResult = await syncAddressToUser(savedQualification);
    
    if (syncResult) {
      console.log('✅ Address sync successful!');
      
      // Verify user was updated
      const updatedUser = await User.findById(savedUser._id);
      console.log('📋 Updated user address:', updatedUser.address);
      
      if (updatedUser.address && updatedUser.address.district === 'Colombo') {
        console.log('🎉 SUCCESS: Address was properly synced to user collection!');
      } else {
        console.log('❌ FAILED: Address was not synced properly');
      }
    } else {
      console.log('❌ Address sync failed');
    }
    
    // Cleanup
    await User.findByIdAndDelete(savedUser._id);
    await CheckProductOfferingQualification.findByIdAndDelete(savedQualification._id);
    console.log('🧹 Cleaned up test data');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
const main = async () => {
  await connectToMongoDB();
  await testAddressSync();
  
  console.log('\n🏁 Address sync test completed');
  process.exit(0);
};

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
  });
}

module.exports = { testAddressSync };
