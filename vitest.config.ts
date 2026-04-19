import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'tests/e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,vue}'],
        exclude: ['src/main.ts', 'src/types/**', 'src/data/**', 'src/i18n/**'],
        reporter: ['text', 'html'],
        thresholds: {
          lines: 80,
          branches: 80,
          functions: 80,
          statements: 80,
          'src/composables/**/*.ts': {
            lines: 95,
            branches: 95,
            functions: 95,
            statements: 95,
          },
          'src/stores/**/*.ts': {
            lines: 95,
            branches: 95,
            functions: 95,
            statements: 95,
          },
        },
      },
    },
  }),
)
