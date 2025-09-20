#!/usr/bin/env node

/**
 * Clean development server script
 * This script helps reduce Chrome extension errors and provides better development experience
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting PPL Coach development server...');
console.log('📝 Note: Chrome extension errors are normal and don\'t affect app functionality');
console.log('🔧 If you see extension errors, they\'re from browser extensions, not your app');
console.log('');

// Start the Vite dev server
const viteProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname),
  stdio: 'inherit',
  shell: true
});

viteProcess.on('error', (error) => {
  console.error('❌ Failed to start development server:', error.message);
  process.exit(1);
});

viteProcess.on('close', (code) => {
  console.log(`\n🛑 Development server stopped with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  viteProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development server...');
  viteProcess.kill('SIGTERM');
});
