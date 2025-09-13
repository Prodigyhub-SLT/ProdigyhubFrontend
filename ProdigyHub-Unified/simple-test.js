const fetch = require('node-fetch');

async function test() {
  try {
    console.log('Testing backend...');
    const response = await fetch('http://localhost:3000/users/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'AEY8jsEB75fwoCXh3yoL6Z47d9O2',
        updates: { firstName: 'Test' }
      })
    });
    
    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Response:', text);
  } catch (error) {
    console.log('Error:', error.message);
  }
}

test();
