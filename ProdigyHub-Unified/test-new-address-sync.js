const { User, CheckProductOfferingQualification } = require('./src/models/AllTMFModels');

async function testNewAddressSync() {
  try {
    console.log('🔄 Testing new address sync approach...\n');

    // Test 1: Check current state
    console.log('1. Current state:');
    const totalUsers = await User.countDocuments();
    const usersWithAddress = await User.countDocuments({
      'address.district': { $exists: true, $ne: null, $ne: '' }
    });
    const qualificationsWithLocation = await CheckProductOfferingQualification.countDocuments({
      'note.text': { $regex: /SLT_LOCATION:/ }
    });
    
    console.log(`  - Total users: ${totalUsers}`);
    console.log(`  - Users with addresses: ${usersWithAddress}`);
    console.log(`  - Users without addresses: ${totalUsers - usersWithAddress}`);
    console.log(`  - Qualifications with location: ${qualificationsWithLocation}`);

    // Test 2: Extract address from a qualification
    console.log('\n2. Testing address extraction:');
    const qualification = await CheckProductOfferingQualification.findOne({
      'note.text': { $regex: /SLT_LOCATION:/ }
    });
    
    if (qualification) {
      console.log(`  Found qualification: ${qualification.id}`);
      
      // Extract address using the same logic as the controller
      const locationNote = qualification.note.find(note => 
        note.text && note.text.startsWith('SLT_LOCATION:')
      );
      
      if (locationNote) {
        const locationText = locationNote.text.replace('SLT_LOCATION:', '');
        const locationData = JSON.parse(locationText);
        
        const address = {
          street: locationData.address || '',
          city: locationData.district || '',
          district: locationData.district || '',
          province: locationData.province || '',
          postalCode: locationData.postalCode || ''
        };
        
        console.log('  Extracted address:', JSON.stringify(address, null, 2));
        
        // Test 3: Find a user to update
        console.log('\n3. Finding user to update:');
        const userWithoutAddress = await User.findOne({
          $or: [
            { 'address.district': { $exists: false } },
            { 'address.district': null },
            { 'address.district': '' }
          ]
        }).sort({ createdAt: -1 });
        
        if (userWithoutAddress) {
          console.log(`  Found user without address: ${userWithoutAddress.email}`);
          
          // Test 4: Update user with address
          console.log('\n4. Updating user with address:');
          const updatedUser = await User.findOneAndUpdate(
            { _id: userWithoutAddress._id },
            { 
              address: address,
              updatedAt: new Date()
            },
            { new: true }
          );
          
          if (updatedUser) {
            console.log('  ✅ Successfully updated user!');
            console.log('  Updated address:', JSON.stringify(updatedUser.address, null, 2));
          } else {
            console.log('  ❌ Failed to update user');
          }
        } else {
          console.log('  ⚠️ No user without address found');
        }
      } else {
        console.log('  ❌ No SLT_LOCATION note found');
      }
    } else {
      console.log('  ❌ No qualification with location found');
    }

    // Test 5: Final state
    console.log('\n5. Final state:');
    const finalUsersWithAddress = await User.countDocuments({
      'address.district': { $exists: true, $ne: null, $ne: '' }
    });
    console.log(`  - Users with addresses: ${finalUsersWithAddress}`);
    console.log(`  - Users without addresses: ${totalUsers - finalUsersWithAddress}`);

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

testNewAddressSync();
