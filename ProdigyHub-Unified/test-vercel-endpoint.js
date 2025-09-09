#!/usr/bin/env node

/**
 * Test script to verify the Vercel endpoint works correctly
 * This will test the qualification endpoint and check if it updates both collections
 */

const testVercelEndpoint = async () => {
  try {
    console.log('🔄 Testing Vercel qualification endpoint...');
    
    // Replace with your actual Vercel backend URL
    const VERCEL_BACKEND_URL = process.env.VERCEL_BACKEND_URL || 'https://your-backend.vercel.app';
    
    const qualificationData = {
      description: 'Test qualification for address sync',
      instantSyncQualification: true,
      provideAlternative: false,
      provideOnlyAvailable: true,
      provideResultReason: false,
      state: "acknowledged",
      creationDate: new Date().toISOString(),
      note: [
        {
          text: 'SLT_LOCATION:{"address":"123 Test Street, Colombo","district":"Colombo","province":"Western","postalCode":"00100"}',
          author: 'Test System',
          date: new Date().toISOString(),
          '@type': 'Note'
        },
        {
          text: 'SLT_SERVICES:["FIBER Broadband (Request)"]',
          author: 'Test System',
          date: new Date().toISOString(),
          '@type': 'Note'
        },
        {
          text: 'SLT_INFRASTRUCTURE:{"fiber":{"available":true,"technology":"FTTH","maxSpeed":"100 Mbps","coverage":100,"monthlyFee":2500},"adsl":{"available":false,"technology":"ADSL2+","maxSpeed":"24 Mbps","coverage":0,"monthlyFee":0},"mobile":{"available":true,"technologies":["4G","5G"],"coverage":"Excellent","signalStrength":"Strong"}}',
          author: 'Test System',
          date: new Date().toISOString(),
          '@type': 'Note'
        },
        {
          text: 'SLT_AREA_MATCH:{"matchedArea":null,"qualificationResult":"qualified"}',
          author: 'Test System',
          date: new Date().toISOString(),
          '@type': 'Note'
        }
      ],
      channel: {},
      checkProductOfferingQualificationItem: [],
      relatedParty: [{
        id: 'test-user-id',
        name: 'Test User',
        email: 'thejana.20232281@iit.ac.lk',
        role: 'customer',
        '@type': 'RelatedPartyRefOrPartyRoleRef'
      }],
      "@baseType": "CheckProductOfferingQualification",
      "@type": "CheckProductOfferingQualification"
    };

    const response = await fetch(`${VERCEL_BACKEND_URL}/productOfferingQualification/v5/checkProductOfferingQualification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://your-frontend.vercel.app'
      },
      body: JSON.stringify(qualificationData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Qualification created successfully!');
      console.log('Qualification ID:', result.id);
      
      // Now check if user was updated
      console.log('🔄 Checking if user was updated...');
      
      const userResponse = await fetch(`${VERCEL_BACKEND_URL}/api/users/email/thejana.20232281@iit.ac.lk`);
      
      if (userResponse.ok) {
        const user = await userResponse.json();
        console.log('📋 User address:', user.address);
        
        if (user.address && user.address.district === 'Colombo') {
          console.log('🎉 SUCCESS: Both qualification and user collections updated!');
        } else {
          console.log('⚠️ User address not updated properly');
        }
      } else {
        console.log('❌ Failed to fetch user data');
      }
      
    } else {
      const errorText = await response.text();
      console.log('❌ Qualification creation failed:', response.status, errorText);
    }
    
  } catch (error) {
    console.error('❌ Error testing endpoint:', error.message);
  }
};

// Instructions for running the test
console.log('📋 To test the Vercel endpoint:');
console.log('1. Set your Vercel backend URL: export VERCEL_BACKEND_URL=https://your-backend.vercel.app');
console.log('2. Run: node test-vercel-endpoint.js');
console.log('');

// Run the test if VERCEL_BACKEND_URL is set
if (process.env.VERCEL_BACKEND_URL) {
  testVercelEndpoint();
} else {
  console.log('⚠️ VERCEL_BACKEND_URL not set. Please set it and run again.');
}
