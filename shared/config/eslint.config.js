import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export const baseConfig = defineConfig([
  globalIgnores(['dist', 'build', 'node_modules', '.next', '.expo', 'android', 'ios']),
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      'max-params': ['error', 3],
      'max-lines-per-function': ['error', 70],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
])

export const reactConfig = defineConfig([
  ...baseConfig,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    extends: [
      ...reactHooks.configs['recommended-latest'],
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      'react/display-name': 'off',
      'react/destructuring-assignment': 'off',
      'react/require-default-props': 'off',
    },
  },
])

export default baseConfig
