#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting iOS bundle build process...');

try {
  // Step 1: Clean previous builds
  console.log('🧹 Cleaning previous builds...');
  const iosBundleDir = path.join(__dirname, '../ios-bundle');
  const iosMainBundle = path.join(__dirname, '../ios/main.jsbundle');

  if (fs.existsSync(iosBundleDir)) {
    fs.rmSync(iosBundleDir, { recursive: true, force: true });
  }

  if (fs.existsSync(iosMainBundle)) {
    fs.unlinkSync(iosMainBundle);
  }

  // Step 2: Export with Expo
  console.log('📦 scaling with Expo...');
  execSync('npx expo export --platform ios --output-dir ./ios-bundle', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });

  // Step 3: Create bundle with React Native
  console.log('🔨 Creating React Native bundle...');
  execSync(
    'npx react-native bundle --entry-file=./ios-bundle/index.js --bundle-output=./ios/main.jsbundle --dev=false --platform=ios --assets-dest=./ios/ --reset-cache',
    {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    }
  );

  // Step 4: Clean up temporary directory
  console.log('🧹 Cleaning up temporary files...');
  if (fs.existsSync(iosBundleDir)) {
    fs.rmSync(iosBundleDir, { recursive: true, force: true });
  }

  console.log('✅ iOS bundle build completed successfully!');
  console.log('📁 Bundle location: ./ios/main.jsbundle');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
