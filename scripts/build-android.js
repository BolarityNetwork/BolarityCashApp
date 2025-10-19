#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Android bundle build process...');

try {
  // Step 1: Clean previous builds
  console.log('🧹 Cleaning previous builds...');
  const androidBundleDir = path.join(__dirname, '../android-bundle');
  const androidMainBundle = path.join(
    __dirname,
    '../android/app/src/main/assets/index.android.bundle'
  );

  if (fs.existsSync(androidBundleDir)) {
    fs.rmSync(androidBundleDir, { recursive: true, force: true });
  }

  if (fs.existsSync(androidMainBundle)) {
    fs.unlinkSync(androidMainBundle);
  }

  // Step 2: Export with Expo
  console.log('📦 Exporting with Expo...');
  execSync('npx expo export --platform android --output-dir ./android-bundle', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });

  // Step 3: Create bundle with React Native
  console.log('🔨 Creating React Native bundle...');
  execSync(
    'npx react-native bundle --entry-file=./android-bundle/index.js --bundle-output=./android/app/src/main/assets/index.android.bundle --dev=false --platform=android --assets-dest=./android/app/src/main/res/ --reset-cache',
    {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    }
  );

  // Step 4: Clean up temporary directory
  console.log('🧹 Cleaning up temporary files...');
  if (fs.existsSync(androidBundleDir)) {
    fs.rmSync(androidBundleDir, { recursive: true, force: true });
  }

  console.log('✅ Android bundle build completed successfully!');
  console.log(
    '📁 Bundle location: ./android/app/src/main/assets/index.android.bundle'
  );
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
