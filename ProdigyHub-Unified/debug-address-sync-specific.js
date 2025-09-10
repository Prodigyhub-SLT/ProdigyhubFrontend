const mongoose = require('mongoose');
const { User, CheckProductOfferingQualification } = require('./src/models/AllTMFModels');
const { syncAddressToUser, extractAddressFromQualification, extractUserEmailFromQualification } = require('./src/api/tmf679/utils/addressSyncUtils');

// Debug script to test address sync with the specific qualification
async function debugAddressSync() {
  try {
    console.log('🔍 Debugging address sync...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prodigyhub');
    console.log('✅ Connected to MongoDB');
    
    // Find the specific qualification
    const qualificationId = 'f38081e2-a0a0-4f8f-985e-f119af2fcb26';
    const qualification = await CheckProductOfferingQualification.findOne({ id: qualificationId });
    
    if (!qualification) {
      console.log('❌ Qualification not found with id:', qualificationId);
      return;
    }
    
    console.log('✅ Found qualification:', qualification.id);
    console.log('Qualification relatedParty:', qualification.relatedParty);
    
    // Test address extraction
    console.log('\n🔍 Testing address extraction...');
    const extractedAddress = extractAddressFromQualification(qualification);
    console.log('Extracted address:', extractedAddress);
    
    // Test email extraction
    console.log('\n🔍 Testing email extraction...');
    const extractedEmail = extractUserEmailFromQualification(qualification);
    console.log('Extracted email:', extractedEmail);
    
    // Find the user
    console.log('\n🔍 Finding user...');
    const user = await User.findOne({ email: extractedEmail });
    if (user) {
      console.log('✅ Found user:', user.email);
      console.log('Current user address:', user.address);
    } else {
      console.log('❌ User not found with email:', extractedEmail);
      return;
    }
    
    // Test address sync
    console.log('\n🔄 Testing address sync...');
    const syncResult = await syncAddressToUser(qualification);
    console.log('Sync result:', syncResult);
    
    // Verify user was updated
    console.log('\n🔍 Verifying user update...');
    const updatedUser = await User.findOne({ email: extractedEmail });
    console.log('Updated user address:', updatedUser.address);
    
    console.log('\n✅ Debug completed!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the debug
debugAddressSync();
