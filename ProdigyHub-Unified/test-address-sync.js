const { User, CheckProductOfferingQualification } = require('./src/models/AllTMFModels');
const { extractAddressFromQualification, syncAddressToUser } = require('./src/api/tmf679/utils/addressSyncUtils');

async function testAddressSync() {
  try {
    console.log('🔄 Testing address sync functionality...\n');

    // Test 1: Extract address from qualification document
    const qualificationDoc = {
      note: [
        {
          text: 'SLT_LOCATION:{"address":"Kurunegala, North Western","district":"Kurunegala","province":"North Western","postalCode":"60060"}',
          author: 'SLT System',
          date: new Date().toISOString(),
          '@type': 'Note'
        }
      ]
    };

    console.log('1. Testing address extraction...');
    const extractedAddress = extractAddressFromQualification(qualificationDoc);
    console.log('✅ Extracted address:', JSON.stringify(extractedAddress, null, 2));

    // Test 2: Check if we have any users without addresses
    console.log('\n2. Checking users without addresses...');
    const usersWithoutAddress = await User.find({
      $or: [
        { 'address.district': { $exists: false } },
        { 'address.district': null },
        { 'address.district': '' }
      ]
    }).limit(5);

    console.log(`Found ${usersWithoutAddress.length} users without addresses:`);
    usersWithoutAddress.forEach(user => {
      console.log(`  - ${user.email} (created: ${user.createdAt})`);
    });

    // Test 3: Try to sync address to a user
    if (usersWithoutAddress.length > 0 && extractedAddress) {
      console.log('\n3. Testing address sync...');
      const testUser = usersWithoutAddress[0];
      console.log(`Updating user: ${testUser.email}`);
      
      const updatedUser = await User.findOneAndUpdate(
        { _id: testUser._id },
        { 
          address: extractedAddress,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (updatedUser) {
        console.log('✅ Successfully updated user with address:');
        console.log(JSON.stringify(updatedUser.address, null, 2));
      } else {
        console.log('❌ Failed to update user');
      }
    } else {
      console.log('⚠️ No users without addresses found or no address extracted');
    }

    // Test 4: Check all users with addresses
    console.log('\n4. Checking all users with addresses...');
    const usersWithAddress = await User.find({
      'address.district': { $exists: true, $ne: null, $ne: '' }
    }).select('email address').limit(10);

    console.log(`Found ${usersWithAddress.length} users with addresses:`);
    usersWithAddress.forEach(user => {
      console.log(`  - ${user.email}:`);
      console.log(`    Address: ${JSON.stringify(user.address, null, 4)}`);
    });

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

testAddressSync();