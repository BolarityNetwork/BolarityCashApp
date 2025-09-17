// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
const { transformer } = config;

const resolveRequestWithPackageExports = (context, moduleName, platform) => {
  // Package exports in `isows` are incorrect, so we need to disable them
  if (moduleName === 'isows') {
    const ctx = {
      ...context,
      unstable_enablePackageExports: false,
    };
    return ctx.resolveRequest(ctx, moduleName, platform);
  }
  // Package exports in `zustand@4` are incorrect, so we need to disable them
  if (moduleName.startsWith('zustand')) {
    const ctx = {
      ...context,
      unstable_enablePackageExports: false,
    };
    return ctx.resolveRequest(ctx, moduleName, platform);
  }
  // Package exports in `jose` are incorrect, so we need to force the browser version
  if (moduleName === 'jose') {
    const ctx = {
      ...context,
      unstable_conditionNames: ['browser'],
    };
    return ctx.resolveRequest(ctx, moduleName, platform);
  }
  // Package exports in `@noble/hashes` have issues with crypto.js
  if (moduleName === '@noble/hashes/crypto') {
    const ctx = {
      ...context,
      unstable_enablePackageExports: false,
    };
    return ctx.resolveRequest(ctx, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),
};

config.resolver.resolveRequest = resolveRequestWithPackageExports;

// 添加对 @noble/hashes 的别名解析
config.resolver.alias = {
  ...config.resolver.alias,
  '@noble/hashes/crypto': '@noble/hashes/crypto.js',
};

// 添加对 .mjs 文件的支持
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

// 添加对 crypto polyfills 的支持
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter(ext => ext !== 'svg'),
  sourceExts: [...config.resolver.sourceExts, 'svg'],
};

module.exports = withNativeWind(config, { input: './global.css' });
