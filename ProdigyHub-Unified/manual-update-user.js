#!/usr/bin/env node

/**
 * Manual script to update user address directly
 */

const mongoose = require('mongoose');
const { User } = require('./src/models/AllTMFModels');

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

// Manual update function
const manualUpdateUser = async () => {
  try {
    console.log('🔄 Manually updating user address...');
    
    // Find the user
    const user = await User.findOne({ email: 'thejana.20232281@iit.ac.lk' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ Found user:', user.email);
    console.log('Current address:', user.address);
    
    // Update with test address
    const testAddress = {
      street: '123 Test Street, Colombo',
      city: 'Colombo',
      district: 'Colombo',
      province: 'Western',
      postalCode: '00100'
    };
    
    const result = await User.updateOne(
      { email: 'thejana.20232281@iit.ac.lk' },
      { 
        $set: {
          address: testAddress,
          updatedAt: new Date()
        }
      }
    );
    
    console.log('Update result:', result);
    
    // Verify update
    const updatedUser = await User.findOne({ email: 'thejana.20232281@iit.ac.lk' });
    console.log('Updated user address:', updatedUser.address);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Run the update
const main = async () => {
  await connectToMongoDB();
  await manualUpdateUser();
  
  console.log('\n🏁 Manual update completed');
  process.exit(0);
};

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}
