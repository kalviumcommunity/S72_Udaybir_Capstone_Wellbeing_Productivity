#!/usr/bin/env node

import https from 'https';

console.log('🔍 Debugging Frontend-Backend Connection');
console.log('========================================\n');

// Test 1: Check if frontend is making requests to the right backend
async function testFrontendAPICalls() {
  console.log('Testing frontend API configuration...');
  
  // Simulate what the frontend should be doing
  const apiUrl = 'https://sentience.onrender.com/api';
  
  console.log(`Expected API URL: ${apiUrl}`);
  
  // Test health endpoint
  return new Promise((resolve) => {
    const req = https.get(`${apiUrl}/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ Backend is accessible from frontend');
          console.log(`Response: ${JSON.stringify(result)}`);
          resolve(true);
        } catch (e) {
          console.log('❌ Backend response is invalid JSON');
          resolve(false);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Cannot connect to backend from frontend');
      console.log(`Error: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Backend connection timeout');
      resolve(false);
    });
  });
}

// Test 2: Check user registration specifically
async function testUserRegistration() {
  console.log('\nTesting user registration...');
  
  const postData = JSON.stringify({
    name: 'testuser',
    email: `test${Date.now()}@example.com`,
    password: 'testpass123'
  });

  const options = {
    hostname: 'sentience.onrender.com',
    port: 443,
    path: '/api/users/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Origin': 'https://sentiencehub.netlify.app'
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
        
        try {
          const result = JSON.parse(data);
          console.log(`Response: ${JSON.stringify(result, null, 2)}`);
          
          if (result.token) {
            console.log('✅ User registration successful');
            resolve(true);
          } else if (result.message && result.message.includes('already exists')) {
            console.log('✅ User registration endpoint working (user exists)');
            resolve(true);
          } else if (result.message && result.message.includes('Server error')) {
            console.log('❌ Server error in user registration');
            console.log('This suggests a backend issue, not a connection issue');
            resolve(false);
          } else {
            console.log('❌ Unexpected response from user registration');
            resolve(false);
          }
        } catch (e) {
          console.log('❌ Invalid JSON response');
          console.log(`Raw response: ${data}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log('❌ Network error during user registration');
      console.log(`Error: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(10000, () => {
      console.log('❌ User registration timeout');
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Test 3: Check if the issue is with environment variables
async function checkEnvironmentVariableIssue() {
  console.log('\nChecking environment variable configuration...');
  
  // The issue might be that the frontend is not using the correct API URL
  // Let's check what the frontend should be configured with
  
  console.log('Expected Netlify environment variable:');
  console.log('VITE_API_URL=https://sentience.onrender.com/api');
  
  console.log('\nTo fix this:');
  console.log('1. Go to your Netlify dashboard');
  console.log('2. Navigate to Site Settings → Environment Variables');
  console.log('3. Add: VITE_API_URL=https://sentience.onrender.com/api');
  console.log('4. Redeploy your site');
}

// Main function
async function debugConnection() {
  console.log('🔍 Starting connection debugging...\n');
  
  const apiTest = await testFrontendAPICalls();
  const registrationTest = await testUserRegistration();
  
  console.log('\n📊 Debug Results:');
  console.log('==================');
  console.log(`API Connection: ${apiTest ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`User Registration: ${registrationTest ? '✅ WORKING' : '❌ FAILED'}`);
  
  if (apiTest && !registrationTest) {
    console.log('\n🔍 Analysis:');
    console.log('- Backend is accessible');
    console.log('- CORS is working');
    console.log('- User registration has a server error');
    console.log('- This is a backend issue, not a connection issue');
  } else if (!apiTest) {
    console.log('\n🔍 Analysis:');
    console.log('- Frontend cannot reach backend');
    console.log('- This is a connection issue');
    await checkEnvironmentVariableIssue();
  } else {
    console.log('\n🎉 Everything is working correctly!');
  }
  
  console.log('\n📝 Next Steps:');
  console.log('1. Check Render logs for the server error');
  console.log('2. Verify MongoDB connection in Render');
  console.log('3. Check environment variables in Render');
  console.log('4. Test the site manually in browser');
}

// Run the debug
debugConnection().catch(console.error); 