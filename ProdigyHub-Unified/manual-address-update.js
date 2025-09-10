const mongoose = require('mongoose');
const { User } = require('./src/models/AllTMFModels');

// Manual script to update user address for testing
async function updateUserAddress() {
  try {
    console.log('🔄 Starting manual address update...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prodigyhub');
    console.log('✅ Connected to MongoDB');
    
    // Find the user by email
    const userEmail = 'thejana.20232281@iit.ac.lk';
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.log('❌ User not found with email:', userEmail);
      return;
    }
    
    console.log('✅ Found user:', user.email);
    
    // Update user with address
    const addressData = {
      street: 'Test Street',
      city: 'Kandy',
      district: 'Kandy',
      province: 'Central',
      postalCode: '0090'
    };
    
    const updatedUser = await User.findOneAndUpdate(
      { email: userEmail },
      { 
        address: addressData,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (updatedUser) {
      console.log('✅ Successfully updated user address:');
      console.log(JSON.stringify(updatedUser.address, null, 2));
    } else {
      console.log('❌ Failed to update user address');
    }
    
  } catch (error) {
    console.error('❌ Error updating user address:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the update
updateUserAddress();
