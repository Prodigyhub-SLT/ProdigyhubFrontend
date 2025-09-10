const mongoose = require('mongoose');
const { User, CheckProductOfferingQualification } = require('./src/models/AllTMFModels');
const { syncAddressToUser, extractAddressFromQualification, extractUserEmailFromQualification } = require('./src/api/tmf679/utils/addressSyncUtils');

// Test script to verify address sync functionality
async function testAddressSync() {
  try {
    console.log('🧪 Starting address sync test...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prodigyhub');
    console.log('✅ Connected to MongoDB');
    
    // Create a test user
    const testUser = new User({
      userId: 'test-user-123',
      userEmail: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phoneNumber: '0712345678',
      nic: '123456789V',
      password: 'hashedpassword',
      status: 'active'
    });
    
    await testUser.save();
    console.log('✅ Created test user:', testUser.email);
    
    // Create a test qualification with address data
    const testQualification = new CheckProductOfferingQualification({
      description: 'SLT Infrastructure Check Completed for Kandy, Central',
      instantSyncQualification: true,
      provideAlternative: false,
      provideOnlyAvailable: true,
      provideResultReason: false,
      state: 'acknowledged',
      note: [
        {
          text: 'SLT_LOCATION:{"address":"Kandy, Central","district":"Kandy","province":"Central","postalCode":"0090"}',
          author: 'SLT System',
          date: new Date(),
          '@type': 'Note'
        },
        {
          text: 'SLT_SERVICES:["Infrastructure Check"]',
          author: 'SLT System',
          date: new Date(),
          '@type': 'Note'
        }
      ],
      relatedParty: [{
        id: testUser.id,
        name: `${testUser.firstName} ${testUser.lastName}`,
        email: testUser.email,
        role: 'customer',
        '@type': 'RelatedPartyRefOrPartyRoleRef'
      }],
      '@baseType': 'CheckProductOfferingQualification',
      '@type': 'CheckProductOfferingQualification'
    });
    
    await testQualification.save();
    console.log('✅ Created test qualification:', testQualification.id);
    
    // Test address extraction
    console.log('\n🔍 Testing address extraction...');
    const extractedAddress = extractAddressFromQualification(testQualification);
    console.log('Extracted address:', extractedAddress);
    
    // Test email extraction
    console.log('\n🔍 Testing email extraction...');
    const extractedEmail = extractUserEmailFromQualification(testQualification);
    console.log('Extracted email:', extractedEmail);
    
    // Test address sync
    console.log('\n🔄 Testing address sync...');
    const syncResult = await syncAddressToUser(testQualification);
    console.log('Sync result:', syncResult);
    
    // Verify user was updated
    console.log('\n🔍 Verifying user update...');
    const updatedUser = await User.findOne({ email: testUser.email });
    console.log('Updated user address:', updatedUser.address);
    
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await User.deleteOne({ _id: testUser._id });
    await CheckProductOfferingQualification.deleteOne({ _id: testQualification._id });
    console.log('✅ Test data cleaned up');
    
    console.log('\n✅ Address sync test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the test
testAddressSync();
