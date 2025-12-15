/**
 * Script to create an admin user
 * Usage: node scripts/create-admin.js <email> <password> <name>
 */

const http = require('http');

const email = process.argv[2] || 'admin@hamere-trufat.com';
const password = process.argv[3] || 'Admin123!';
const name = process.argv[4] || 'Admin User';

const data = JSON.stringify({
  name,
  email,
  password,
  role: 'admin',
});

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/v1/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
  },
};

console.log('Creating admin user...');
console.log(`Email: ${email}`);
console.log(`Name: ${name}`);
console.log('');

const req = http.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 201 || res.statusCode === 200) {
      console.log('✅ Admin user created successfully!');
      console.log('');
      console.log('You can now login with:');
      console.log(`  Email: ${email}`);
      console.log(`  Password: ${password}`);
    } else {
      try {
        const error = JSON.parse(responseData);
        if (error.message === 'Email already registered') {
          console.log('⚠️  User already exists. You can login with:');
          console.log(`  Email: ${email}`);
          console.log(`  Password: ${password}`);
        } else {
          console.log('❌ Error:', error.message || responseData);
        }
      } catch (e) {
        console.log('❌ Error:', responseData);
      }
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Connection error:', error.message);
  console.error('');
  console.error('Make sure the backend is running on http://localhost:4000');
  console.error('Start it with: cd backend && npm run start:dev');
});

req.write(data);
req.end();

