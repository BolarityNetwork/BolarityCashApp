module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        { jsxImportSource: 'nativewind', unstable_transformImportMeta: true },
      ],
      'nativewind/babel',
    ],
    plugins: [
      // Reanimated plugin has to be listed last.
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          alias: {
            '@': './',
          },
        },
      ],
    ],
  };
};
