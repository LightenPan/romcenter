const path = require('path');
const webpack = require('webpack');

window.__API_HOST__ = 'http://wekafei.cn';

module.exports = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  output: {
    path: path.resolve('romcenter'),
  },
  // plugins: [
  //   new webpack.DefinePlugin({
  //     __API_HOST__: 'http://wekafei.cn',
  //   }),
  // ],
};
