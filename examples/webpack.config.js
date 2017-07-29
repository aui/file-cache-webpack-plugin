const path = require('path');
const FsCacheWebpackPlugin = require('../');

module.exports = (env = {}) => {
  return {
    context: __dirname,
    entry: {
      libs: './src/libs.js',
    },
    output: {
      path: path.join(__dirname, 'dist'),
      filename: '[name].[hash].js',
    },
    module: {
      rules: [{
        test: /\.js$/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ['es2015'],
          },
        }],
      }],
    },
    plugins: [
      env.fscache ? new FsCacheWebpackPlugin() : () => {},
    ],
  };
};
