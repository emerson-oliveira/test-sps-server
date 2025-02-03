const pluginJs = require('@eslint/js');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = [
  pluginJs.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
      },
      globals: {
        __dirname: 'readonly',
        __filename: 'readonly',
        require: 'readonly',
        module: 'readonly',
        process: 'readonly',
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'no-console': 'off',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
    },
  },
];