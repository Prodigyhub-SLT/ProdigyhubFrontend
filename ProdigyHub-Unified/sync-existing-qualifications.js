const { User, CheckProductOfferingQualification } = require('./src/models/AllTMFModels');
const { extractAddressFromQualification, syncAddressToUser } = require('./src/api/tmf679/utils/addressSyncUtils');

async function syncExistingQualifications() {
  try {
    console.log('🔄 Syncing existing qualifications to users...\n');

    // Get all qualifications with SLT_LOCATION notes
    const qualifications = await CheckProductOfferingQualification.find({
      'note.text': { $regex: /SLT_LOCATION:/ }
    }).limit(10);

    console.log(`Found ${qualifications.length} qualifications with location data\n`);

    for (const qualification of qualifications) {
      console.log(`Processing qualification: ${qualification.id}`);
      
      // Extract address from qualification
      const address = extractAddressFromQualification(qualification);
      if (!address) {
        console.log('  ⚠️ No address found in qualification');
        continue;
      }

      console.log('  📍 Address:', JSON.stringify(address, null, 2));

      // Try to sync to user
      const success = await syncAddressToUser(qualification);
      if (success) {
        console.log('  ✅ Successfully synced to user');
      } else {
        console.log('  ❌ Failed to sync to user');
      }
      
      console.log(''); // Empty line for readability
    }

    // Show final results
    console.log('📊 Final Results:');
    const usersWithAddress = await User.find({
      'address.district': { $exists: true, $ne: null, $ne: '' }
    }).countDocuments();

    const totalUsers = await User.countDocuments();
    
    console.log(`  - Total users: ${totalUsers}`);
    console.log(`  - Users with addresses: ${usersWithAddress}`);
    console.log(`  - Users without addresses: ${totalUsers - usersWithAddress}`);

  } catch (error) {
    console.error('❌ Error during sync:', error.message);
  }
}

syncExistingQualifications();