#!/usr/bin/env node

/**
 * Script to create the user in the Vercel deployed backend
 */

const fetch = require('node-fetch');

// Replace this with your actual Vercel backend URL
const VERCEL_BACKEND_URL = 'https://your-backend.vercel.app'; // UPDATE THIS URL

async function createUserInVercelBackend() {
  console.log('🔄 Creating user in Vercel deployed backend...');
  console.log('🌐 Backend URL:', VERCEL_BACKEND_URL);

  try {
    // Create the user with the correct userId
    const userData = {
      firstName: 'Thejana',
      lastName: 'Jayalath',
      email: 'thejana.20232281@iit.ac.lk',
      phoneNumber: '0771234567',
      nic: '12345678',
      password: 'tempPassword123', // Temporary password
      userId: 'AEY8jsEB75fwoCXh3yoL6Z47d9O2' // The correct MongoDB userId
    };

    console.log('📝 Creating user with data:', userData);

    const response = await fetch(`${VERCEL_BACKEND_URL}/users/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    console.log('📊 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ User created successfully in Vercel backend!');
      console.log('📋 Created user:', result.user);
    } else {
      const errorText = await response.text();
      console.log('❌ User creation failed:', errorText);
      
      // If user already exists, try to update them
      if (response.status === 409) {
        console.log('🔄 User already exists, trying to update...');
        
        const updateResponse = await fetch(`${VERCEL_BACKEND_URL}/users/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: 'AEY8jsEB75fwoCXh3yoL6Z47d9O2',
            updates: {
              firstName: 'Thejana',
              lastName: 'Jayalath',
              email: 'thejana.20232281@iit.ac.lk',
              phoneNumber: '0771234567',
              nic: '12345678'
            }
          })
        });
        
        if (updateResponse.ok) {
          console.log('✅ User updated successfully in Vercel backend!');
        } else {
          const updateError = await updateResponse.text();
          console.log('❌ User update failed:', updateError);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
createUserInVercelBackend();
