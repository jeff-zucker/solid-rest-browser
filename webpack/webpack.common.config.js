/* Shared webpack configuration */

const path = require('path');

module.exports = {
  context: path.resolve(__dirname, '..'),
  mode: 'production',
  entry: {
    'solid-rest-browser': './src/index.js',
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
      },
    ],
  },
  devtool: 'source-map',
};
