const webpack = require("webpack");

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    crypto: require.resolve("crypto-browserify"),
    stream: require.resolve("stream-browserify"),
    assert: require.resolve("assert"),
    http: require.resolve("stream-http"),
    https: require.resolve("https-browserify"),
    os: require.resolve("os-browserify"),
    url: require.resolve("url"),
    fs: require.resolve("browserify-fs"),
    // "node-fetch": require.resolve("node-fetch"),
    // "node:fs": require.resolve("browserify-fs"),
    // process: require.resolve("browserify-process"),
  });
  config.resolve.fallback = fallback;
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ]);

  config.externals = {
    // You can use `false` or other values if you need something strange here,example will output `module.exports = {};`
    "process/browser": "{}",
    "node:buffer": "{}",
    "node:fs": "{}",
    "node:https": "{}",
    "node:http": "{}",
    "node:net": "{}",
    "node:path": "{}",
    "node:stream": "{}",
    "node:url": "{}",
    "node:util": "{}",
    "node:zlib": "{}",
    worker_threads: "{}",
    "node-fetch": "{}",
  };
  config.ignoreWarnings = [/Failed to parse source map/];
  return config;
};
