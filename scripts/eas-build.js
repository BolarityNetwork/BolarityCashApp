#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const EASBuildConfig = require('./eas-build-config');

const platform = process.argv[2] || 'ios';
const profile = process.argv[3] || 'production';

console.log(`🚀 Starting EAS build for ${platform} with ${profile} profile...`);

try {
  const buildConfig = new EASBuildConfig();

  // Step 1: Validate configuration
  buildConfig.validateConfig();

  // Step 2: Check dependencies
  buildConfig.checkDependencies();

  // Step 3: Prepare build environment
  buildConfig.prepareBuildEnvironment(platform, profile);

  // Step 4: Export with Expo
  console.log('📦 Exporting with Expo...');
  execSync(
    `npx expo export --platform ${platform} --output-dir ./${platform}-bundle`,
    {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    }
  );

  // Step 5: Create bundle with React Native
  console.log('🔨 Creating React Native bundle...');

  let bundleOutput, assetsDest, entryFile;
  const bundleDir = path.join(__dirname, `../${platform}-bundle`);

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

  // Step 6: Clean up temporary directory
  console.log('🧹 Cleaning up temporary files...');
  if (fs.existsSync(bundleDir)) {
    fs.rmSync(bundleDir, { recursive: true, force: true });
  }

  // Step 7: Start EAS Build
  console.log('🏗️ Starting EAS build...');
  execSync(
    `npx eas build --platform ${platform} --profile ${profile} --local`,
    {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    }
  );

  console.log(`✅ EAS build completed successfully for ${platform}!`);

  // Generate success report
  if (typeof buildConfig !== 'undefined') {
    buildConfig.generateBuildReport(platform, profile, true);
  }
} catch (error) {
  console.error('❌ EAS build failed:', error.message);

  // Generate error report
  if (typeof buildConfig !== 'undefined') {
    buildConfig.generateBuildReport(platform, profile, false, error);
  }

  process.exit(1);
}
