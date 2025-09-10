const mongoose = require('mongoose');
const { User, CheckProductOfferingQualification } = require('./src/models/AllTMFModels');
const { syncAddressToUser } = require('./src/api/tmf679/utils/addressSyncUtils');

// Test script to verify the user name fix works
async function testUserNameFix() {
  try {
    console.log('🧪 Testing user name fix...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prodigyhub');
    console.log('✅ Connected to MongoDB');
    
    // Find the existing user
    const userEmail = 'thejanashehan.com@gmail.com';
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.log('❌ User not found with email:', userEmail);
      return;
    }
    
    console.log('✅ Found user:', user.email);
    console.log('User name:', user.firstName, user.lastName);
    
    // Create a test qualification with proper relatedParty including name and email
    const testQualification = new CheckProductOfferingQualification({
      description: 'SLT Infrastructure Check Completed for Kurunegala, North Western',
      instantSyncQualification: true,
      provideAlternative: false,
      provideOnlyAvailable: true,
      provideResultReason: false,
      state: 'acknowledged',
      note: [
        {
          text: 'SLT_LOCATION:{"address":"Kurunegala, North Western","district":"Kurunegala","province":"North Western","postalCode":"60060"}',
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
        id: user.id,
        name: `${user.firstName} ${user.lastName}`, // Use the actual name from user
        email: user.email,
        role: 'customer',
        '@type': 'RelatedPartyRefOrPartyRoleRef'
      }],
      '@baseType': 'CheckProductOfferingQualification',
      '@type': 'CheckProductOfferingQualification'
    });
    
    await testQualification.save();
    console.log('✅ Created test qualification:', testQualification.id);
    console.log('RelatedParty name:', testQualification.relatedParty[0].name);
    
    // Test address sync
    console.log('\n🔄 Testing address sync...');
    const syncResult = await syncAddressToUser(testQualification);
    console.log('Sync result:', syncResult);
    
    // Verify user was updated
    console.log('\n🔍 Verifying user update...');
    const updatedUser = await User.findOne({ email: userEmail });
    console.log('Updated user address:', updatedUser.address);
    
    // Cleanup
    console.log('\n🧹 Cleaning up test qualification...');
    await CheckProductOfferingQualification.deleteOne({ _id: testQualification._id });
    console.log('✅ Test qualification cleaned up');
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the test
testUserNameFix();
