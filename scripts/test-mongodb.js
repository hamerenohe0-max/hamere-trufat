/**
 * Test MongoDB Connection
 * Usage: node scripts/test-mongodb.js
 */

// Use backend's node_modules
const path = require('path');
const backendPath = path.join(__dirname, '..', 'backend');
process.env.NODE_PATH = path.join(backendPath, 'node_modules');
require('module')._initPaths();

const mongoose = require('mongoose');
const fs = require('fs');

// Read .env file manually
const envPath = path.join(backendPath, '.env');
let mongoUri = 'mongodb://localhost:27017/hamere-trufat';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/MONGODB_URI=(.+)/);
  if (match) {
    mongoUri = match[1].trim();
  }
}

console.log('🔍 Testing MongoDB Connection...');
console.log('');
console.log('Connection String:', mongoUri.replace(/:[^:@]+@/, ':****@')); // Hide password
console.log('');

// Test connection
mongoose
  .connect(mongoUri, {
    serverSelectionTimeoutMS: 5000, // 5 seconds timeout
  })
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    console.log('');
    console.log('Connection details:');
    console.log('  - Host:', mongoose.connection.host);
    console.log('  - Database:', mongoose.connection.name);
    console.log('  - Ready State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected');
    console.log('');
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((error) => {
    console.log('❌ MongoDB connection failed!');
    console.log('');
    console.log('Error:', error.message);
    console.log('');
    
    // Common error messages and solutions
    if (error.message.includes('authentication failed')) {
      console.log('💡 Solution: Check your username and password in the connection string');
    } else if (error.message.includes('IP')) {
      console.log('💡 Solution: Add your IP address to MongoDB Atlas Network Access whitelist');
      console.log('   1. Go to MongoDB Atlas Dashboard');
      console.log('   2. Click "Network Access"');
      console.log('   3. Click "Add IP Address"');
      console.log('   4. Add "0.0.0.0/0" (all IPs) for testing, or your specific IP');
    } else if (error.message.includes('timeout')) {
      console.log('💡 Solution: Check your internet connection and MongoDB Atlas cluster status');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.log('💡 Solution: Check the connection string hostname is correct');
    }
    
    console.log('');
    process.exit(1);
  });

