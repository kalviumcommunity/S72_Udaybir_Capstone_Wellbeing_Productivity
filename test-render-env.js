#!/usr/bin/env node

import https from 'https';

console.log('🔧 Testing Render Environment Variables');
console.log('=====================================\n');

// Test if JWT_SECRET is properly set by trying to create a token
async function testJWTSecret() {
  console.log('Testing JWT_SECRET environment variable...');
  
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
        try {
          const result = JSON.parse(data);
          console.log(`Status Code: ${res.statusCode}`);
          console.log(`Response: ${JSON.stringify(result, null, 2)}`);
          
          if (result.error && result.error.includes('MongoDB')) {
            console.log('❌ MongoDB connection issue detected');
            console.log('This suggests MONGODB_URI is not set correctly in Render');
            resolve(false);
          } else if (result.token) {
            console.log('✅ JWT_SECRET is working correctly');
            resolve(true);
          } else if (result.message && result.message.includes('Server error')) {
            console.log('❌ Server error - likely missing environment variables');
            console.log('Check these environment variables in Render:');
            console.log('- MONGODB_URI');
            console.log('- JWT_SECRET');
            resolve(false);
          } else {
            console.log('❌ Unexpected response');
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
      console.log('❌ Network error');
      console.log(`Error: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(10000, () => {
      console.log('❌ Request timeout');
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Test MongoDB connection specifically
async function testMongoDBConnection() {
  console.log('\nTesting MongoDB connection...');
  
  const req = https.get('https://sentience.onrender.com/api/health', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        if (result.status === 'ok') {
          console.log('✅ Server is running');
          console.log('⚠️  But we need to check if MongoDB is connected');
          console.log('Check Render logs for MongoDB connection messages');
        } else {
          console.log('❌ Server health check failed');
        }
      } catch (e) {
        console.log('❌ Invalid health check response');
      }
    });
  });
  
  req.on('error', (err) => {
    console.log('❌ Cannot reach server');
  });
  
  req.setTimeout(10000, () => {
    console.log('❌ Health check timeout');
  });
}

// Main function
async function testEnvironmentVariables() {
  console.log('🔧 Starting environment variable tests...\n');
  
  await testMongoDBConnection();
  const jwtTest = await testJWTSecret();
  
  console.log('\n📊 Test Results:');
  console.log('================');
  console.log(`JWT Secret Test: ${jwtTest ? '✅ PASS' : '❌ FAIL'}`);
  
  if (!jwtTest) {
    console.log('\n🔧 Fix Instructions:');
    console.log('===================');
    console.log('1. Go to your Render dashboard');
    console.log('2. Click on your backend service');
    console.log('3. Go to "Environment" tab');
    console.log('4. Verify these environment variables are set:');
    console.log('   - MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-sentience?retryWrites=true&w=majority');
    console.log('   - JWT_SECRET=your-super-secret-jwt-key-change-this-in-production');
    console.log('   - NODE_ENV=production');
    console.log('   - PORT=10000');
    console.log('5. Redeploy your service after adding/updating variables');
  } else {
    console.log('\n🎉 Environment variables are working correctly!');
  }
  
  console.log('\n📝 Next Steps:');
  console.log('1. Check Render logs for specific error messages');
  console.log('2. Verify MongoDB Atlas connection string');
  console.log('3. Ensure all environment variables are set in Render');
  console.log('4. Redeploy the backend service');
}

// Run the tests
testEnvironmentVariables().catch(console.error); 