#!/usr/bin/env node

/**
 * Script to check what users exist in the MongoDB database
 */

const fetch = require('node-fetch');

// Replace this with your actual Vercel backend URL
const VERCEL_BACKEND_URL = 'https://your-backend.vercel.app'; // UPDATE THIS URL

async function checkUsersInMongo() {
  console.log('🔍 Checking users in MongoDB...');
  console.log('🌐 Backend URL:', VERCEL_BACKEND_URL);

  try {
    // Get all users
    const response = await fetch(`${VERCEL_BACKEND_URL}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('📊 Response status:', response.status);
    
    if (response.ok) {
      const users = await response.json();
      console.log('✅ Users retrieved successfully!');
      console.log('📋 Total users:', users.length);
      
      // Look for thejana user
      const thejanaUser = users.find(user => 
        user.email === 'thejana.20232281@iit.ac.lk' || 
        user.userEmail === 'thejana.20232281@iit.ac.lk'
      );
      
      if (thejanaUser) {
        console.log('✅ Found thejana user:');
        console.log('📋 User details:', {
          id: thejanaUser.id,
          userId: thejanaUser.userId,
          userEmail: thejanaUser.userEmail,
          email: thejanaUser.email,
          firstName: thejanaUser.firstName,
          lastName: thejanaUser.lastName
        });
      } else {
        console.log('❌ thejana user not found');
        console.log('📋 Available users:');
        users.forEach((user, index) => {
          console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - userId: ${user.userId || 'NOT SET'}`);
        });
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Failed to get users:', errorText);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
checkUsersInMongo();
