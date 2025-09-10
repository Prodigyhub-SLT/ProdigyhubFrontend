const mongoose = require('mongoose');
const { User } = require('./src/models/AllTMFModels');

// Manual script to update the specific user with address from the qualification
async function updateUserAddressManually() {
  try {
    console.log('🔄 Starting manual address update...');
    
    // Connect to MongoDB (try different connection strings)
    const connectionStrings = [
      process.env.MONGODB_URI,
      'mongodb://localhost:27017/prodigyhub',
      'mongodb://127.0.0.1:27017/prodigyhub',
      'mongodb+srv://your-connection-string' // Replace with your actual connection string
    ];
    
    let connected = false;
    for (const connectionString of connectionStrings) {
      if (connectionString) {
        try {
          await mongoose.connect(connectionString);
          console.log('✅ Connected to MongoDB with:', connectionString);
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
    
    // Find the user by email
    const userEmail = 'thejanashehan.com@gmail.com';
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.log('❌ User not found with email:', userEmail);
      return;
    }
    
    console.log('✅ Found user:', user.email);
    console.log('Current user address:', user.address);
    
    // Address data from the qualification
    const addressData = {
      street: 'Kurunegala, North Western', // Using the address from qualification
      city: 'Kurunegala',
      district: 'Kurunegala',
      province: 'North Western',
      postalCode: '60060'
    };
    
    // Update user with address
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
updateUserAddressManually();
