const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

let entries = {
  'full': './src/full.js',
  'core': './src/core.js',
  'authn': './src/authn.js',
  'myaccount': './src/myaccount.js'
};

// if ENTRY env var is passed, filter the entries to include only the named ENTRY
if (process.env.ENTRY) {
  entries = {
    [process.env.ENTRY]: entries[process.env.ENTRY]
  };
}


module.exports = Object.keys(entries).map((entryName) => {
  return {
    mode: 'production',
    entry: {
      [entryName]: entries[entryName]
    },
    output: {
      path: path.join(__dirname, 'target'),
      filename: '[name].js',
    },
    plugins: [
      new BundleAnalyzerPlugin({
        openAnalyzer: false,
        reportFilename: `${entryName}.analyzer.html`,
        analyzerMode: 'static',
        defaultSizes: 'stat'
      })
    ],
    optimization: {
      usedExports: true,
      minimizer: [
        new TerserPlugin()
      ]
    }
  };
});
