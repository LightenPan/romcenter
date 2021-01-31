const path = require('path');

module.exports = {
  entry: 'src/index.jsx',
  publicPath: './',
  plugins: [
    ['ice-plugin-fusion', {
      themePackage: '@icedesign/theme',
    }],
    ['ice-plugin-moment-locales', {
      locales: ['zh-cn'],
    }],
  ],
  alias: {
    '@': path.resolve(__dirname, './src/'),
  },
  define: {
    // 此处不能省略 JSON.stringify，否则构建过程会出现语法问题
    ASSETS_VERSION: JSON.stringify('0.0.1'),
    __API_HOST__: JSON.stringify('http://wekafei.cn'),
  },
};
