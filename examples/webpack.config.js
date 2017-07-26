const path = require('path');
const FileCacheWebpackPlugin = require('../');

const fileCacheWebpackPlugin = new FileCacheWebpackPlugin();
const PATHS = {
  app: path.join(__dirname, 'app'),
  another: path.join(__dirname, 'another'),
  build: path.join(__dirname, 'build'),
};

module.exports = [
  {
    entry: {
      app: PATHS.app,
    },
    output: {
      path: path.join(PATHS.build, 'first'),
      filename: '[name].js',
    },
    plugins: [
      fileCacheWebpackPlugin,
    ],
  },
  {
    entry: {
      first: PATHS.app,
      second: PATHS.another,
    },
    output: {
      path: path.join(PATHS.build, 'second'),
      filename: '[name].js',
    },
    plugins: [
      fileCacheWebpackPlugin,
    ],
  },
];
