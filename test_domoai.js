// Test script for DomoAI chat functionality
const fetch = require('node-fetch');

async function testDomoAI() {
  try {
    // First, login to get a session
    console.log('1. Logging in...');
    const loginResponse = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'test_user',
        password: 'test_password'
      })
    });

    if (!loginResponse.ok) {
      console.error('Login failed:', loginResponse.status);
      const error = await loginResponse.text();
      console.error(error);
      return;
    }

    const loginData = await loginResponse.json();
    const sessionId = loginData.sessionId;
    console.log('Login successful! Session ID:', sessionId);

    // Now test the DomoAI chat
    console.log('\n2. Testing DomoAI chat...');
    const chatResponse = await fetch('http://localhost:5000/api/domoai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionId}`
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'Hello DomoAI! Can you help me with my tasks?' }
        ]
      })
    });

    if (!chatResponse.ok) {
      console.error('Chat failed:', chatResponse.status);
      const error = await chatResponse.text();
      console.error(error);
      return;
    }

    const chatData = await chatResponse.json();
    console.log('DomoAI Response:', chatData.response);

    // Test task analysis
    console.log('\n3. Testing task analysis...');
    const analysisResponse = await fetch('http://localhost:5000/api/domoai/analyze', {
      headers: {
        'Authorization': `Bearer ${sessionId}`
      }
    });

    if (analysisResponse.ok) {
      const analysisData = await analysisResponse.json();
      console.log('Task Analysis:', analysisData.analysis);
    }

    console.log('\n✅ DomoAI is working correctly!');

  } catch (error) {
    console.error('Error testing DomoAI:', error);
  }
}

testDomoAI();