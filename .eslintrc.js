const { eslint, deepmerge } = require('@ice/spec');

module.exports = deepmerge(eslint, {
  rules: {
    "global-require": 0,
  },
  "parserOptions": {
    "ecmaFeatures": {
      "legacyDecorators": true,
    },
  },
});
