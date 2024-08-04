const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  resolve: {
    fallback: {
      "crypto": false,
    },
  },
  plugins: [
    new NodePolyfillPlugin(),
  ],
  // other configurations...
};
