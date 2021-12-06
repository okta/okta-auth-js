const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  plugins: [
    new BundleAnalyzerPlugin()
  ],
  optimization: {
    usedExports: true,
    minimizer: [
      new TerserPlugin()
    ]
  }
};
