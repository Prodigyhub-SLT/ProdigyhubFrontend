#!/usr/bin/env node

/**
 * Test script to verify the API endpoint is working
 */

const fetch = require('node-fetch');

const testAPIEndpoint = async () => {
  try {
    console.log('🔄 Testing API endpoint...');
    
    // Test the user update endpoint
    const testAddress = {
      street: '123 Test Street, Colombo',
      city: 'Colombo',
      district: 'Colombo',
      province: 'Western',
      postalCode: '00100'
    };
    
    const response = await fetch('http://localhost:3000/api/users/email/thejana.20232281@iit.ac.lk', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: testAddress,
        updatedAt: new Date().toISOString()
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ API endpoint working!');
      console.log('Updated user:', result);
    } else {
      const errorText = await response.text();
      console.log('❌ API endpoint failed:', response.status, errorText);
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
};

// Run the test
testAPIEndpoint();
