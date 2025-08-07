#!/usr/bin/env node

import https from 'https';

const BACKEND_URL = 'https://sentience.onrender.com';
const FRONTEND_URL = 'https://sentiencehub.netlify.app';

console.log('🔗 Testing Netlify + Render Connection');
console.log('=====================================\n');

// Test backend health
function testBackendHealth() {
  return new Promise((resolve, reject) => {
    const req = https.get(`${BACKEND_URL}/api/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.status === 'ok') {
            console.log('✅ Backend Health Check: PASSED');
            resolve(true);
          } else {
            console.log('❌ Backend Health Check: FAILED');
            resolve(false);
          }
        } catch (e) {
          console.log('❌ Backend Health Check: FAILED (Invalid JSON)');
          resolve(false);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Backend Health Check: FAILED (Network Error)');
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Backend Health Check: FAILED (Timeout)');
      resolve(false);
    });
  });
}

// Test user registration
function testUserRegistration() {
  return new Promise((resolve, reject) => {
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
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.token) {
            console.log('✅ User Registration: PASSED');
            resolve(true);
          } else if (result.message && result.message.includes('already exists')) {
            console.log('✅ User Registration: PASSED (User already exists)');
            resolve(true);
          } else {
            console.log('❌ User Registration: FAILED');
            console.log('   Response:', result);
            resolve(false);
          }
        } catch (e) {
          console.log('❌ User Registration: FAILED (Invalid JSON)');
          console.log('   Response:', data);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log('❌ User Registration: FAILED (Network Error)');
      resolve(false);
    });

    req.setTimeout(10000, () => {
      console.log('❌ User Registration: FAILED (Timeout)');
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Test frontend accessibility
function testFrontend() {
  return new Promise((resolve, reject) => {
    const req = https.get(FRONTEND_URL, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Frontend Accessibility: PASSED');
        resolve(true);
      } else {
        console.log(`❌ Frontend Accessibility: FAILED (Status: ${res.statusCode})`);
        resolve(false);
      }
    });
    
    req.on('error', (err) => {
      console.log('❌ Frontend Accessibility: FAILED (Network Error)');
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Frontend Accessibility: FAILED (Timeout)');
      resolve(false);
    });
  });
}

// Main test function
async function runTests() {
  console.log('🧪 Running connection tests...\n');
  
  const backendHealth = await testBackendHealth();
  const userRegistration = await testUserRegistration();
  const frontendAccess = await testFrontend();
  
  console.log('\n📊 Test Results:');
  console.log('================');
  console.log(`Backend Health: ${backendHealth ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`User Registration: ${userRegistration ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Frontend Access: ${frontendAccess ? '✅ PASS' : '❌ FAIL'}`);
  
  if (backendHealth && frontendAccess) {
    console.log('\n🎉 Basic connection is working!');
    console.log('\n📝 Next Steps:');
    console.log('1. Set VITE_API_URL in Netlify environment variables');
    console.log('2. Redeploy your Netlify site');
    console.log('3. Test the full application functionality');
  } else {
    console.log('\n⚠️  Some tests failed. Check the issues above.');
  }
  
  console.log('\n🔗 Your URLs:');
  console.log(`Backend: ${BACKEND_URL}`);
  console.log(`Frontend: ${FRONTEND_URL}`);
}

// Run the tests
runTests().catch(console.error); 