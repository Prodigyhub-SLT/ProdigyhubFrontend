#!/usr/bin/env node

/**
 * Debug script to check what users exist in MongoDB
 */

const mongoose = require('mongoose');
const { User } = require('./src/models/AllTMFModels');

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prodigyhub');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const debugUsers = async () => {
  try {
    console.log('🔍 Debugging users in MongoDB...');
    
    // Get total count
    const totalUsers = await User.countDocuments();
    console.log(`📊 Total users in database: ${totalUsers}`);
    
    if (totalUsers === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    // Get all users with key fields
    const users = await User.find({})
      .select('userId userEmail email firstName lastName id createdAt')
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log('\n📋 Recent users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   UserID: ${user.userId || 'NOT SET'}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('   ---');
    });
    
    // Check for users with specific patterns
    console.log('\n🔍 Checking for specific patterns:');
    
    // Users with userId field
    const usersWithUserId = await User.countDocuments({ userId: { $exists: true, $ne: null } });
    console.log(`Users with userId field: ${usersWithUserId}`);
    
    // Users without userId field
    const usersWithoutUserId = await User.countDocuments({ 
      $or: [
        { userId: { $exists: false } },
        { userId: null },
        { userId: '' }
      ]
    });
    console.log(`Users without userId field: ${usersWithoutUserId}`);
    
    // Users with specific email patterns
    const testUsers = await User.find({ 
      email: { $regex: /test|admin|user/, $options: 'i' } 
    }).select('email userId firstName lastName');
    
    if (testUsers.length > 0) {
      console.log('\n🧪 Test users found:');
      testUsers.forEach(user => {
        console.log(`- ${user.email} (userId: ${user.userId || 'NOT SET'})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error debugging users:', error);
  }
};

const main = async () => {
  await connectToMongoDB();
  await debugUsers();
  await mongoose.disconnect();
  console.log('✅ Disconnected from MongoDB');
};

main();
