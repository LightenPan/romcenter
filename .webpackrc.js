const path = require('path');
const webpack = require('webpack');

module.exports = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  output: {
    path: path.resolve('romcenter'),
  },
  plugins: [
    new webpack.DefinePlugin({
      __API_HOST__: JSON.stringify(config.apiHost),
    }),
  ],
};
