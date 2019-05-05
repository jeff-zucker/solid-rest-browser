/* Browser bundle that exposes solid-rest-browser as window.appfetch */

const path = require('path');
// const CleanWebpackPlugin = require('clean-webpack-plugin');
const { context, mode, entry, module: _module, devtool } = require('./webpack.common.config');

const outputDir = './dist';

module.exports = {
  context,
  mode,
  entry,
  output: {
    filename: '[name].js',
    path: path.resolve(outputDir),
    // libraryExport: 'default',
    library: 'SolidRestBrowser',
    libraryTarget: 'umd',
  },
  module: _module,
//  plugins: [new CleanWebpackPlugin([outputDir])],
  devtool
};
