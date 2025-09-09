#!/usr/bin/env node

/**
 * Debug script to check address sync for specific user
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

// Debug function
const debugAddressSync = async () => {
  try {
    console.log('🔍 Debugging address sync for user: thejana.20232281@iit.ac.lk');
    
    // Find the user
    const user = await User.findOne({ email: 'thejana.20232281@iit.ac.lk' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ Found user:', {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      address: user.address
    });
    
    // Find qualifications for this user
    const qualifications = await CheckProductOfferingQualification.find({
      'relatedParty.email': 'thejana.20232281@iit.ac.lk'
    }).sort({ createdAt: -1 });
    
    console.log(`📊 Found ${qualifications.length} qualifications for this user`);
    
    for (const qual of qualifications) {
      console.log(`\n🔍 Qualification ${qual.id}:`);
      console.log('  Description:', qual.description);
      console.log('  Related Party:', qual.relatedParty);
      
      // Check for address in notes
      if (qual.note && qual.note.length > 0) {
        const locationNote = qual.note.find(note => 
          note.text && note.text.startsWith('SLT_LOCATION:')
        );
        
        if (locationNote) {
          console.log('  ✅ Found SLT_LOCATION note:', locationNote.text);
          
          // Test address extraction
          const { extractAddressFromQualification } = require('./src/api/tmf679/utils/addressSyncUtils');
          const address = extractAddressFromQualification(qual);
          console.log('  📍 Extracted address:', address);
          
          // Test sync
          console.log('  🔄 Testing address sync...');
          const syncResult = await syncAddressToUser(qual);
          console.log('  📋 Sync result:', syncResult);
        } else {
          console.log('  ❌ No SLT_LOCATION note found');
        }
      } else {
        console.log('  ❌ No notes found');
      }
    }
    
    // Check user address after sync
    const updatedUser = await User.findOne({ email: 'thejana.20232281@iit.ac.lk' });
    console.log('\n📋 User address after sync:', updatedUser.address);
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
};

// Run the debug
const main = async () => {
  await connectToMongoDB();
  await debugAddressSync();
  
  console.log('\n🏁 Debug completed');
  process.exit(0);
};

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Debug script failed:', error);
    process.exit(1);
  });
}

module.exports = { debugAddressSync };
