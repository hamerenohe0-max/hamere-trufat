// Generate secure JWT secrets for production
const crypto = require('crypto');

const jwtSecret = crypto.randomBytes(32).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(32).toString('hex');

console.log('\n🔐 JWT Secrets Generated\n');
console.log('JWT_SECRET:');
console.log(jwtSecret);
console.log('\nJWT_REFRESH_SECRET:');
console.log(jwtRefreshSecret);
console.log('\n✅ Copy these to your hosting environment variables!\n');

