const { eslint, deepmerge } = require('@ice/spec');

module.exports = deepmerge(eslint, {
  rules: {
    "global-require": 0,
    "eslintno-underscore-dangle": 0,
    "no-underscore-dangle": 0,
    
  },
  "parserOptions": {
    "ecmaFeatures": {
      "legacyDecorators": true,
    },
  },
  "extends": [
    "plugin:react-hooks/recommended"
  ],
  "globals": {
      "__API_HOST__": "readonly",
  },
});
