const { User } = require('./src/models/AllTMFModels');

async function testAddressFormat() {
  try {
    // Find a user with address data
    const user = await User.findOne({ 
      'address.district': { $exists: true, $ne: null, $ne: '' } 
    }).select('email address');
    
    if (user) {
      console.log('✅ Found user with address:');
      console.log('Email:', user.email);
      console.log('Address:', JSON.stringify(user.address, null, 2));
    } else {
      console.log('❌ No user found with address data');
      
      // Check all users
      const allUsers = await User.find({}).select('email address').limit(5);
      console.log('\nAll users:');
      allUsers.forEach(u => {
        console.log(`Email: ${u.email}, Address: ${JSON.stringify(u.address)}`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAddressFormat();
