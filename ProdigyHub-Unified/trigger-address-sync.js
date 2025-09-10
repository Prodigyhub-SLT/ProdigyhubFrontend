const mongoose = require('mongoose');
const { User, CheckProductOfferingQualification } = require('./src/models/AllTMFModels');
const { syncAddressToUser } = require('./src/api/tmf679/utils/addressSyncUtils');

// Script to manually trigger address sync for existing qualification
async function triggerAddressSync() {
  try {
    console.log('🔄 Triggering address sync for existing qualification...');
    
    // Try to connect to MongoDB
    const connectionStrings = [
      process.env.MONGODB_URI,
      'mongodb://localhost:27017/prodigyhub',
      'mongodb://127.0.0.1:27017/prodigyhub'
    ];
    
    let connected = false;
    for (const connectionString of connectionStrings) {
      if (connectionString) {
        try {
          await mongoose.connect(connectionString);
          console.log('✅ Connected to MongoDB');
          connected = true;
          break;
        } catch (error) {
          console.log('❌ Failed to connect with:', connectionString);
        }
      }
    }
    
    if (!connected) {
      console.log('❌ Could not connect to MongoDB. Please check your connection string.');
      return;
    }
    
    // Find the specific qualification
    const qualificationId = 'f38081e2-a0a0-4f8f-985e-f119af2fcb26';
    const qualification = await CheckProductOfferingQualification.findOne({ id: qualificationId });
    
    if (!qualification) {
      console.log('❌ Qualification not found with id:', qualificationId);
      return;
    }
    
    console.log('✅ Found qualification:', qualification.id);
    console.log('Qualification relatedParty:', qualification.relatedParty);
    
    // Test address sync
    console.log('\n🔄 Testing address sync...');
    const syncResult = await syncAddressToUser(qualification);
    console.log('Sync result:', syncResult);
    
    // Verify user was updated
    console.log('\n🔍 Verifying user update...');
    const userEmail = 'thejanashehan.com@gmail.com';
    const updatedUser = await User.findOne({ email: userEmail });
    if (updatedUser) {
      console.log('Updated user address:', updatedUser.address);
    } else {
      console.log('User not found');
    }
    
    console.log('\n✅ Address sync completed!');
    
  } catch (error) {
    console.error('❌ Error during address sync:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the sync
triggerAddressSync();
