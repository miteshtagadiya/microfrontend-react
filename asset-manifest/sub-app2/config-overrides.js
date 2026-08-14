module.exports = function override(config) {
  config.optimization.runtimeChunk = false;
  config.optimization.splitChunks = {
    cacheGroups: {
      default: false,
    },
  };
  return config;
};
