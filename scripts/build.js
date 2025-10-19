#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const platform = process.argv[2] || 'ios';

console.log(`🚀 Starting ${platform} bundle build process...`);

try {
  // Step 1: Clean previous builds
  console.log('🧹 Cleaning previous builds...');
  const bundleDir = path.join(__dirname, `../${platform}-bundle`);

  if (fs.existsSync(bundleDir)) {
    fs.rmSync(bundleDir, { recursive: true, force: true });
  }

  // Step 2: Export with Expo
  console.log('📦 Exporting with Expo...');
  execSync(
    `npx expo export --platform ${platform} --output-dir ./${platform}-bundle`,
    {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    }
  );

  // Step 3: Create bundle with React Native
  console.log('🔨 Creating React Native bundle...');

  let bundleOutput, assetsDest, entryFile;

  // Find the actual entry file (could be .js or .hbc)
  const expoStaticDir = path.join(bundleDir, '_expo', 'static', 'js', platform);

  if (fs.existsSync(expoStaticDir)) {
    const staticFiles = fs.readdirSync(expoStaticDir);
    const bundleFile = staticFiles.find(
      file => file.endsWith('.hbc') || file.endsWith('.js')
    );
    if (bundleFile) {
      entryFile = path.join(expoStaticDir, bundleFile);
    }
  }

  if (!entryFile) {
    entryFile = `./${platform}-bundle/index.js`;
  }

  if (platform === 'ios') {
    bundleOutput = './ios/main.jsbundle';
    assetsDest = './ios/';
  } else {
    bundleOutput = './android/app/src/main/assets/index.android.bundle';
    assetsDest = './android/app/src/main/res/';
  }

  // Copy the bundle file directly if it's already compiled
  if (entryFile.endsWith('.hbc')) {
    console.log('📋 Copying Hermes bytecode bundle...');
    fs.copyFileSync(entryFile, bundleOutput);
  } else {
    execSync(
      `npx react-native bundle --entry-file=${entryFile} --bundle-output=${bundleOutput} --dev=false --platform=${platform} --assets-dest=${assetsDest} --reset-cache`,
      {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..'),
      }
    );
  }

  // Step 4: Clean up temporary directory
  console.log('🧹 Cleaning up temporary files...');
  if (fs.existsSync(bundleDir)) {
    fs.rmSync(bundleDir, { recursive: true, force: true });
  }

  console.log(`✅ ${platform} bundle build completed successfully!`);
  console.log(`📁 Bundle location: ${bundleOutput}`);
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
