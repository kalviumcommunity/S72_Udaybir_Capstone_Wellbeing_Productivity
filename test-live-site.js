#!/usr/bin/env node

import https from 'https';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const FRONTEND_URL = 'https://sentiencehub.netlify.app';
const BACKEND_URL = 'https://sentience.onrender.com';

console.log('🐛 Testing Live Site for Bugs');
console.log('==============================\n');

// Test 1: Frontend Accessibility
async function testFrontendAccess() {
  return new Promise((resolve) => {
    const req = https.get(FRONTEND_URL, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Frontend Access: PASSED');
        resolve(true);
      } else {
        console.log(`❌ Frontend Access: FAILED (Status: ${res.statusCode})`);
        resolve(false);
      }
    });
    
    req.on('error', (err) => {
      console.log('❌ Frontend Access: FAILED (Network Error)');
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Frontend Access: FAILED (Timeout)');
      resolve(false);
    });
  });
}

// Test 2: Backend Health
async function testBackendHealth() {
  return new Promise((resolve) => {
    const req = https.get(`${BACKEND_URL}/api/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.status === 'ok') {
            console.log('✅ Backend Health: PASSED');
            resolve(true);
          } else {
            console.log('❌ Backend Health: FAILED');
            resolve(false);
          }
        } catch (e) {
          console.log('❌ Backend Health: FAILED (Invalid JSON)');
          resolve(false);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Backend Health: FAILED (Network Error)');
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Backend Health: FAILED (Timeout)');
      resolve(false);
    });
  });
}

// Test 3: API Connection (CORS)
async function testAPIConnection() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'sentience.onrender.com',
      port: 443,
      path: '/api/health',
      method: 'GET',
      headers: {
        'Origin': 'https://sentiencehub.netlify.app',
        'User-Agent': 'Mozilla/5.0 (compatible; TestBot)'
      }
    };

    const req = https.request(options, (res) => {
      const corsHeader = res.headers['access-control-allow-origin'];
      if (corsHeader && (corsHeader.includes('sentiencehub.netlify.app') || corsHeader === '*')) {
        console.log('✅ CORS Configuration: PASSED');
        resolve(true);
      } else {
        console.log('❌ CORS Configuration: FAILED');
        console.log(`   CORS Header: ${corsHeader}`);
        resolve(false);
      }
    });

    req.on('error', (err) => {
      console.log('❌ CORS Configuration: FAILED (Network Error)');
      resolve(false);
    });

    req.setTimeout(10000, () => {
      console.log('❌ CORS Configuration: FAILED (Timeout)');
      resolve(false);
    });

    req.end();
  });
}

// Test 4: User Registration
async function testUserRegistration() {
  return new Promise((resolve) => {
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
            console.log(`   Response: ${JSON.stringify(result)}`);
            resolve(false);
          }
        } catch (e) {
          console.log('❌ User Registration: FAILED (Invalid JSON)');
          console.log(`   Response: ${data}`);
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

// Test 5: Task API
async function testTaskAPI() {
  return new Promise((resolve) => {
    const req = https.get(`${BACKEND_URL}/api/tasks`, (res) => {
      if (res.statusCode === 200 || res.statusCode === 401) {
        console.log('✅ Task API: PASSED');
        resolve(true);
      } else {
        console.log(`❌ Task API: FAILED (Status: ${res.statusCode})`);
        resolve(false);
      }
    });
    
    req.on('error', (err) => {
      console.log('❌ Task API: FAILED (Network Error)');
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Task API: FAILED (Timeout)');
      resolve(false);
    });
  });
}

// Test 6: Notes API
async function testNotesAPI() {
  return new Promise((resolve) => {
    const req = https.get(`${BACKEND_URL}/api/notes`, (res) => {
      if (res.statusCode === 200 || res.statusCode === 401) {
        console.log('✅ Notes API: PASSED');
        resolve(true);
      } else {
        console.log(`❌ Notes API: FAILED (Status: ${res.statusCode})`);
        resolve(false);
      }
    });
    
    req.on('error', (err) => {
      console.log('❌ Notes API: FAILED (Network Error)');
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Notes API: FAILED (Timeout)');
      resolve(false);
    });
  });
}

// Test 7: Mood API
async function testMoodAPI() {
  return new Promise((resolve) => {
    const req = https.get(`${BACKEND_URL}/api/mood`, (res) => {
      if (res.statusCode === 200 || res.statusCode === 401) {
        console.log('✅ Mood API: PASSED');
        resolve(true);
      } else {
        console.log(`❌ Mood API: FAILED (Status: ${res.statusCode})`);
        resolve(false);
      }
    });
    
    req.on('error', (err) => {
      console.log('❌ Mood API: FAILED (Network Error)');
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Mood API: FAILED (Timeout)');
      resolve(false);
    });
  });
}

// Test 8: Study Sessions API
async function testStudySessionsAPI() {
  return new Promise((resolve) => {
    const req = https.get(`${BACKEND_URL}/api/study-sessions`, (res) => {
      if (res.statusCode === 200 || res.statusCode === 401) {
        console.log('✅ Study Sessions API: PASSED');
        resolve(true);
      } else {
        console.log(`❌ Study Sessions API: FAILED (Status: ${res.statusCode})`);
        resolve(false);
      }
    });
    
    req.on('error', (err) => {
      console.log('❌ Study Sessions API: FAILED (Network Error)');
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Study Sessions API: FAILED (Timeout)');
      resolve(false);
    });
  });
}

// Test 9: Focus Sessions API
async function testFocusSessionsAPI() {
  return new Promise((resolve) => {
    const req = https.get(`${BACKEND_URL}/api/focus-sessions`, (res) => {
      if (res.statusCode === 200 || res.statusCode === 401) {
        console.log('✅ Focus Sessions API: PASSED');
        resolve(true);
      } else {
        console.log(`❌ Focus Sessions API: FAILED (Status: ${res.statusCode})`);
        resolve(false);
      }
    });
    
    req.on('error', (err) => {
      console.log('❌ Focus Sessions API: FAILED (Network Error)');
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Focus Sessions API: FAILED (Timeout)');
      resolve(false);
    });
  });
}

// Main test function
async function runAllTests() {
  console.log('🧪 Running comprehensive bug tests...\n');
  
  const tests = [
    { name: 'Frontend Access', fn: testFrontendAccess },
    { name: 'Backend Health', fn: testBackendHealth },
    { name: 'CORS Configuration', fn: testAPIConnection },
    { name: 'User Registration', fn: testUserRegistration },
    { name: 'Task API', fn: testTaskAPI },
    { name: 'Notes API', fn: testNotesAPI },
    { name: 'Mood API', fn: testMoodAPI },
    { name: 'Study Sessions API', fn: testStudySessionsAPI },
    { name: 'Focus Sessions API', fn: testFocusSessionsAPI }
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await test.fn();
    results.push({ name: test.name, passed: result });
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${result.name}: ${status}`);
  });
  
  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Your site is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the issues above.');
  }
  
  console.log('\n🔗 Your URLs:');
  console.log(`Frontend: ${FRONTEND_URL}`);
  console.log(`Backend: ${BACKEND_URL}`);
  
  // Additional recommendations
  console.log('\n📝 Manual Testing Recommendations:');
  console.log('1. Visit the site and test user registration/login');
  console.log('2. Test all features (tasks, notes, mood, etc.)');
  console.log('3. Check browser console for any JavaScript errors');
  console.log('4. Test on different devices and browsers');
}

// Run the tests
runAllTests().catch(console.error); 