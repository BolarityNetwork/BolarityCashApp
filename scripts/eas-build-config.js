#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// EAS Build Configuration Helper
class EASBuildConfig {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.easJsonPath = path.join(this.projectRoot, 'eas.json');
    this.appJsonPath = path.join(this.projectRoot, 'app.json');
  }

  // Validate EAS configuration
  validateConfig() {
    console.log('🔍 Validating EAS configuration...');

    if (!fs.existsSync(this.easJsonPath)) {
      throw new Error('eas.json not found');
    }

    if (!fs.existsSync(this.appJsonPath)) {
      throw new Error('app.json not found');
    }

    const easConfig = JSON.parse(fs.readFileSync(this.easJsonPath, 'utf8'));
    const appConfig = JSON.parse(fs.readFileSync(this.appJsonPath, 'utf8'));

    // Validate iOS configuration
    if (appConfig.expo.ios) {
      const iosConfig = appConfig.expo.ios;
      if (!iosConfig.bundleIdentifier) {
        console.warn('⚠️ iOS bundle identifier not set');
      }
      if (!iosConfig.appleTeamId) {
        console.warn('⚠️ Apple Team ID not set');
      }
    }

    // Validate Android configuration
    if (appConfig.expo.android) {
      const androidConfig = appConfig.expo.android;
      if (!androidConfig.package) {
        console.warn('⚠️ Android package name not set');
      }
    }

    console.log('✅ EAS configuration validation completed');
    return { easConfig, appConfig };
  }

  // Prepare build environment
  prepareBuildEnvironment(platform, profile) {
    console.log(`🔧 Preparing build environment for ${platform} ${profile}...`);

    // Ensure bundle directory exists
    const bundleDir = path.join(this.projectRoot, `${platform}-bundle`);
    if (fs.existsSync(bundleDir)) {
      fs.rmSync(bundleDir, { recursive: true, force: true });
    }

    // Ensure output directories exist
    if (platform === 'ios') {
      const iosDir = path.join(this.projectRoot, 'ios');
      if (!fs.existsSync(iosDir)) {
        fs.mkdirSync(iosDir, { recursive: true });
      }
    } else if (platform === 'android') {
      const androidAssetsDir = path.join(
        this.projectRoot,
        'android',
        'app',
        'src',
        'main',
        'assets'
      );
      if (!fs.existsSync(androidAssetsDir)) {
        fs.mkdirSync(androidAssetsDir, { recursive: true });
      }
    }

    console.log('✅ Build environment prepared');
  }

  // Check dependencies
  checkDependencies() {
    console.log('📦 Checking dependencies...');

    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    const requiredDeps = ['expo', 'eas-cli'];
    const missingDeps = requiredDeps.filter(
      dep =>
        !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
    );

    if (missingDeps.length > 0) {
      console.warn(`⚠️ Missing dependencies: ${missingDeps.join(', ')}`);
      console.log('💡 Run: npm install --save-dev eas-cli');
    } else {
      console.log('✅ All required dependencies found');
    }
  }

  // Generate build report
  generateBuildReport(platform, profile, success, error = null) {
    const report = {
      timestamp: new Date().toISOString(),
      platform,
      profile,
      success,
      error: error?.message || null,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    };

    const reportPath = path.join(
      this.projectRoot,
      'build-reports',
      `${platform}-${profile}-${Date.now()}.json`
    );
    const reportsDir = path.dirname(reportPath);

    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Build report saved to: ${reportPath}`);
  }
}

module.exports = EASBuildConfig;
