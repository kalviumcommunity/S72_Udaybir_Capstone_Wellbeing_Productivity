#!/usr/bin/env node

import https from 'https';

console.log('🔍 Testing MongoDB Connection');
console.log('============================\n');

// Test the current MongoDB connection
async function testMongoDBConnection() {
  console.log('Testing current MongoDB connection...');
  
  // First, let's test if we can connect to MongoDB Atlas
  const testUri = 'mongodb+srv://uday:uday@cluster0.bfbjoot.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  
  console.log('Current MongoDB URI:', testUri.replace(/\/\/.*@/, '//***:***@'));
  
  // Test if the server can connect to MongoDB
  const req = https.get('https://sentience.onrender.com/api/health', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('✅ Server health check passed');
        console.log('Response:', result);
        
        // Now test a simple database operation
        testDatabaseOperation();
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

// Test a database operation
async function testDatabaseOperation() {
  console.log('\nTesting database operation...');
  
  // Try to create a test user
  const postData = JSON.stringify({
    name: 'mongodb-test',
    email: `mongodb-test-${Date.now()}@example.com`,
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
        
        try {
          const result = JSON.parse(data);
          console.log('Response:', JSON.stringify(result, null, 2));
          
          if (result.token) {
            console.log('✅ MongoDB connection is working!');
            console.log('✅ User registration successful');
            resolve(true);
          } else if (result.error) {
            console.log('❌ MongoDB error detected:');
            console.log('Error:', result.error);
            console.log('Message:', result.message);
            resolve(false);
          } else if (result.message && result.message.includes('Server error')) {
            console.log('❌ Server error - likely MongoDB connection issue');
            console.log('\n🔧 Possible fixes:');
            console.log('1. Check if MongoDB Atlas cluster is running');
            console.log('2. Verify network access in MongoDB Atlas');
            console.log('3. Check if IP whitelist includes Render IPs');
            console.log('4. Verify database name in connection string');
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

// Main function
async function testMongoDB() {
  console.log('🔍 Starting MongoDB connection test...\n');
  
  await testMongoDBConnection();
  const dbTest = await testDatabaseOperation();
  
  console.log('\n📊 Test Results:');
  console.log('================');
  console.log(`MongoDB Connection: ${dbTest ? '✅ WORKING' : '❌ FAILED'}`);
  
  if (!dbTest) {
    console.log('\n🔧 Recommended MongoDB Atlas Settings:');
    console.log('======================================');
    console.log('1. Go to MongoDB Atlas dashboard');
    console.log('2. Click on your cluster');
    console.log('3. Go to "Network Access"');
    console.log('4. Add IP address: 0.0.0.0/0 (allow all)');
    console.log('5. Go to "Database Access"');
    console.log('6. Ensure user "uday" has readWrite permissions');
    console.log('7. Update connection string to include database name:');
    console.log('   mongodb+srv://uday:uday@cluster0.bfbjoot.mongodb.net/student-sentience?retryWrites=true&w=majority');
  } else {
    console.log('\n🎉 MongoDB connection is working perfectly!');
  }
}

// Run the test
testMongoDB().catch(console.error); 