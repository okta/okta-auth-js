const path = require('path');
const PORT = process.env.PORT || 8080;
const SIW_DIR = path.resolve(require.resolve('@okta/okta-signin-widget'), '..', '..');

const babelOptions = {
  presets: ['@babel/env'],
  plugins: ['@babel/plugin-transform-runtime'],
  sourceType: 'unambiguous'
};

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'app-bundle.js',
    publicPath: '/'
  },
  devServer: {
    contentBase: [
      path.join(__dirname, 'public'),
      SIW_DIR
    ],
    port: PORT,
    before: function(app) {
      app.get('/implicit/callback', function(req, res, next) {
        req.url = '/';
        next();
      });
    }
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: babelOptions
      }
    ]
  }
};
