const mongoose = require('mongoose');
const { User, CheckProductOfferingQualification } = require('./src/models/AllTMFModels');
const { syncAddressToUser, extractAddressFromQualification, extractUserEmailFromQualification } = require('./src/api/tmf679/utils/addressSyncUtils');

// Debug the address sync process step by step
async function debugAddressSyncProcess() {
  try {
    console.log('🔍 Debugging address sync process...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prodigyhub');
    console.log('✅ Connected to MongoDB');
    
    // Find the most recent qualification
    const recentQual = await CheckProductOfferingQualification.findOne().sort({ createdAt: -1 });
    
    if (!recentQual) {
      console.log('❌ No qualifications found');
      return;
    }
    
    console.log('✅ Found recent qualification:', recentQual.id);
    console.log('Description:', recentQual.description);
    console.log('Related Party:', recentQual.relatedParty);
    
    // Step 1: Test address extraction
    console.log('\n🔍 Step 1: Testing address extraction...');
    const extractedAddress = extractAddressFromQualification(recentQual);
    console.log('Extracted address:', extractedAddress);
    
    if (!extractedAddress) {
      console.log('❌ Address extraction failed - this is the problem!');
      
      // Let's see what's in the notes
      console.log('Notes in qualification:');
      recentQual.note.forEach((note, index) => {
        console.log(`  Note ${index}:`, note.text);
      });
      return;
    }
    
    // Step 2: Test email extraction
    console.log('\n🔍 Step 2: Testing email extraction...');
    const extractedEmail = extractUserEmailFromQualification(recentQual);
    console.log('Extracted email:', extractedEmail);
    
    if (!extractedEmail) {
      console.log('❌ Email extraction failed - this is the problem!');
      return;
    }
    
    // Step 3: Test user finding
    console.log('\n🔍 Step 3: Testing user finding...');
    const user = await User.findOne({ email: extractedEmail });
    if (!user) {
      console.log('❌ User not found - this is the problem!');
      console.log('Looking for email:', extractedEmail);
      
      // Let's see what users exist
      const allUsers = await User.find({}).select('email').limit(5);
      console.log('Available users:');
      allUsers.forEach(u => console.log('  -', u.email));
      return;
    }
    
    console.log('✅ Found user:', user.email);
    console.log('Current user address:', user.address);
    
    // Step 4: Test address sync
    console.log('\n🔍 Step 4: Testing address sync...');
    const syncResult = await syncAddressToUser(recentQual);
    console.log('Sync result:', syncResult);
    
    // Step 5: Verify user was updated
    console.log('\n🔍 Step 5: Verifying user update...');
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
debugAddressSyncProcess();
