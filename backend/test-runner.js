#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🧪 Starting Backend Tests...\n');

const jest = spawn('npx', ['jest', '--verbose', '--colors'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname,
});

jest.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ All tests passed!');
  } else {
    console.log(`\n❌ Tests failed with code ${code}`);
    process.exit(code);
  }
});

jest.on('error', (error) => {
  console.error('Error running tests:', error);
  process.exit(1);
});

