// Baseline lint config for this Docusaurus 3 + React 19 site. Pragmatic on
// purpose: this is a first-time setup, not an attempt to make the existing
// ~30-file codebase pass cleanly — see the plan notes for outstanding count.
const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const globals = require('globals');

module.exports = [
  {
    ignores: ['build/**', '.docusaurus/**', 'node_modules/**', 'static/**'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ...js.configs.recommended,
  },
  // TypeScript-specific rules only apply to the animate-ui .ts/.tsx subtree —
  // the rest of the codebase is plain CommonJS/ESM JS and shouldn't be
  // subject to TS-oriented rules like no-require-imports.
  ...tseslint.config({
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.recommended],
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  }),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    settings: { react: { version: '19' } },
    rules: {
      ...react.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/react-in-jsx-scope': 'off', // not needed with the React 19 JSX runtime
      'react/prop-types': 'off', // this codebase doesn't use prop-types
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
];
