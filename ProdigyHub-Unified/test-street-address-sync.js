const mongoose = require('mongoose');
const { User, CheckProductOfferingQualification } = require('./src/models/AllTMFModels');
const { syncAddressToUser, extractAddressFromQualification } = require('./src/api/tmf679/utils/addressSyncUtils');

// Test script to verify street address sync
async function testStreetAddressSync() {
  try {
    console.log('🧪 Testing street address sync...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prodigyhub');
    console.log('✅ Connected to MongoDB');
    
    // Create a test qualification with street address
    const testQualification = new CheckProductOfferingQualification({
      description: 'SLT Infrastructure Check Completed for Kurunegala, North Western',
      instantSyncQualification: true,
      provideAlternative: false,
      provideOnlyAvailable: true,
      provideResultReason: false,
      state: 'acknowledged',
      note: [
        {
          text: 'SLT_LOCATION:{"address":"No-89/1 Mawathagama, Kurunegala, Kurunegala, North Western","street":"No-89/1 Mawathagama","city":"Kurunegala","district":"Kurunegala","province":"North Western","postalCode":"60060"}',
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
        id: 'test-user-123',
        name: 'Test User',
        email: 'thejanashehan.com@gmail.com',
        role: 'customer',
        '@type': 'RelatedPartyRefOrPartyRoleRef'
      }],
      '@baseType': 'CheckProductOfferingQualification',
      '@type': 'CheckProductOfferingQualification'
    });
    
    await testQualification.save();
    console.log('✅ Created test qualification with street address:', testQualification.id);
    
    // Test address extraction
    console.log('\n🔍 Testing address extraction...');
    const extractedAddress = extractAddressFromQualification(testQualification);
    console.log('Extracted address:', extractedAddress);
    
    // Test address sync
    console.log('\n🔄 Testing address sync...');
    const syncResult = await syncAddressToUser(testQualification);
    console.log('Sync result:', syncResult);
    
    // Verify user was updated
    console.log('\n🔍 Verifying user update...');
    const updatedUser = await User.findOne({ email: 'thejanashehan.com@gmail.com' });
    if (updatedUser) {
      console.log('Updated user address:', JSON.stringify(updatedUser.address, null, 2));
    } else {
      console.log('User not found');
    }
    
    // Cleanup
    console.log('\n🧹 Cleaning up test qualification...');
    await CheckProductOfferingQualification.deleteOne({ _id: testQualification._id });
    console.log('✅ Test qualification cleaned up');
    
    console.log('\n✅ Street address sync test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the test
testStreetAddressSync();
