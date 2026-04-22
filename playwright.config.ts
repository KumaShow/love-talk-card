import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e/playwright',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    actionTimeout: 0,
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    /** 對齊專案 Vue 元件慣例：使用 data-test 而非 data-testid。 */
    testIdAttribute: 'data-test',
    ...devices['iPhone 14'],
  },
  projects: [
    {
      name: 'iphone-14-portrait',
      use: {
        ...devices['iPhone 14'],
        viewport: { width: 390, height: 844 },
      },
      /** WebKit 對 Service Worker + setOffline 組合有相容性問題，PWA 離線測試改用 chromium project。 */
      testIgnore: ['**/us5-offline-pwa.spec.ts'],
    },
    {
      name: 'chromium-mobile-pwa',
      use: {
        ...devices['Pixel 7'],
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
      },
      testMatch: ['**/us5-offline-pwa.spec.ts'],
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
})
