module.exports = {
  env: {
    browser: true,
    es2020: true,
    jquery: true,
  },
  plugins: ['html'],
  extends: ['airbnb-base', 'eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 11,
    project: 'tsconfig.json',
  },
  rules: { 'no-unused-vars': 'off', 'no-use-before-define': 'off', 'import/extensions': [0, { js: 'always' }] },

  // rules: {},
};
