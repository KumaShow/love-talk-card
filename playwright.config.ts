import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

/**
 * Vite 預設 dev port 為 5173，本地開發時該 port 常被其他 Vue 專案佔用，
 * 加上 `webServer.reuseExistingServer: true` 會造成 Playwright 誤連到錯誤
 * 的 app 造成 selector 全數 timeout。因此本專案 E2E 改用 5174，並透過
 * `npm run dev -- --port 5174` 強制 Vite 啟動到對應 port。
 * 詳見 specs/001-love-talk-card-game/tasks.md 2026-04-23 修訂紀錄。
 */
const DEV_SERVER_PORT = 5174

export default defineConfig({
  testDir: './tests/e2e/playwright',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  /**
   * 本地與 CI 一律使用單一 worker。
   * 本專案 dev server 以單一 port (5174) 供所有 spec 共用，多 worker 並行時會競用
   * 同一個 Vite HMR 連線，造成 T081 a11y 測試的 `page.$$eval` 偶發讀到過時 DOM、
   * 以及 T040/T095 US1 抽 15 張卡的動畫時序被其他 worker 的 dev server 請求拖慢。
   * 詳見 T084 flaky 排查（Phase 8）：單獨跑與 workers=1 皆穩定通過 16/16。
   */
  workers: 1,
  reporter: 'html',
  use: {
    actionTimeout: 0,
    baseURL: `http://localhost:${DEV_SERVER_PORT}`,
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
      /**
       * - WebKit 對 Service Worker + setOffline 組合有相容性問題，PWA 離線測試改用 chromium project。
       * - 效能煙霧測試需 Chromium DevTools Protocol 的 `Network.emulateNetworkConditions`，WebKit 不支援，亦改用 chromium project。
       */
      testIgnore: ['**/us5-offline-pwa.spec.ts', '**/perf.spec.ts'],
    },
    {
      name: 'chromium-mobile-pwa',
      use: {
        ...devices['Pixel 7'],
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
      },
      testMatch: ['**/us5-offline-pwa.spec.ts', '**/perf.spec.ts'],
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${DEV_SERVER_PORT}`,
    port: DEV_SERVER_PORT,
    reuseExistingServer: !process.env.CI,
  },
})
