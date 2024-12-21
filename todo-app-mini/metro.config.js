const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts }
  } = await getDefaultConfig();
  return {
    transformer: {
      babelTransformerPath: require.resolve('react-native/scripts/transformer')
    },
    resolver: {
      assetExts: assetExts.filter(ext => ext !== 'ts' && ext !== 'tsx'),
      sourceExts: [...sourceExts, 'tsx', 'ts']
    }
  };
})(); 