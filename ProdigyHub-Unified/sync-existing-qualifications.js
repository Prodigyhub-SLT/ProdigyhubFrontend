#!/usr/bin/env node

/**
 * Script to sync existing qualifications to user collection
 * This will process all existing qualifications and update users with address information
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

// Sync existing qualifications
const syncExistingQualifications = async () => {
  try {
    console.log('🔄 Starting sync of existing qualifications...');
    
    // Get all qualifications with address data
    const qualifications = await CheckProductOfferingQualification.find({
      'note.text': { $regex: /SLT_LOCATION:/ }
    }).sort({ createdAt: -1 });

    console.log(`📊 Found ${qualifications.length} qualifications with address data`);

    let syncedCount = 0;
    let errorCount = 0;

    for (const qualification of qualifications) {
      try {
        console.log(`\n🔄 Processing qualification ${qualification.id}...`);
        
        const success = await syncAddressToUser(qualification);
        
        if (success) {
          syncedCount++;
          console.log(`✅ Successfully synced qualification ${qualification.id}`);
        } else {
          console.log(`⚠️  No user found for qualification ${qualification.id}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error processing qualification ${qualification.id}:`, error.message);
      }
    }

    console.log('\n📈 Sync Summary:');
    console.log(`✅ Successfully synced: ${syncedCount}`);
    console.log(`⚠️  No user found: ${qualifications.length - syncedCount - errorCount}`);
    console.log(`❌ Errors: ${errorCount}`);

  } catch (error) {
    console.error('❌ Error in sync process:', error);
  }
};

// Run the sync
const main = async () => {
  await connectToMongoDB();
  await syncExistingQualifications();
  
  console.log('\n🏁 Qualification sync completed');
  process.exit(0);
};

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = { syncExistingQualifications };
