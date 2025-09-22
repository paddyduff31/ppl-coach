import { reactConfig } from '@ppl-coach/config/eslint.config.js'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  ...reactConfig,
  {
    files: ['**/*.{ts,tsx}'],
    extends: [reactRefresh.configs.vite],
  },
])
