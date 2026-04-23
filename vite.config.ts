import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * Vite 設定。
 *
 * PWA 設定（T075）：
 * - registerType: 'autoUpdate' → Service Worker 更新後自動替換，無需手動 prompt。
 * - Workbox generateSW 模式：Vite 產出的資源以 precache 模式注入 SW。
 * - globPatterns 覆蓋所有靜態資產（含音效 wav/ogg/mp3 佔位）以符合完全離線要求。
 * - manifest 欄位對應 specs/001-love-talk-card-game/contracts/pwa-manifest.json。
 *
 * Bundle 預算（T080，量測於 2026-04-23，commit 主線 Phase 8）：
 * - 初始載入 JS：58.75 KB gzip（dist/assets/index-*.js）
 * - 初始載入 CSS：6.12 KB gzip（dist/assets/index-*.css）
 * - index.html：0.38 KB gzip
 * - 合計 ≈ 65.3 KB gzip，遠低於憲章硬上限 ≤200 KB gzip。
 * - PWA precache 總量：228.68 KiB（含音效 WAV 佔位與 PWA icons，不計入初始載入預算）。
 * - 深入分析：`npx vite-bundle-visualizer` 可產 dist/stats.html 互動式 treemap。
 */
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      includeAssets: ['favicon.ico', 'icons/**', 'sounds/**'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,png,svg,ico,ogg,mp3,wav,webmanifest}'],
        // 所有資產均為靜態，走 precache；無需 runtimeCaching
        cleanupOutdatedCaches: true,
        // 首次安裝即接管現有 client，確保離線測試與真實部署的首次離線體驗一致
        clientsClaim: true,
        skipWaiting: true,
        // SPA 路由：所有 navigation 請求回退到 precache 的 index.html
        navigateFallback: 'index.html',
      },
      manifest: {
        name: 'Love Talk Card',
        short_name: 'Love Talk',
        description: '情侶對話卡牌遊戲——深度連結的對話，從一張牌開始',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#FFF0F5',
        theme_color: '#E8A0BF',
        lang: 'zh-TW',
        dir: 'ltr',
        categories: ['games', 'lifestyle', 'social'],
        icons: [
          { src: 'icons/icon-72x72.png', sizes: '72x72', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-96x96.png', sizes: '96x96', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-128x128.png', sizes: '128x128', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-144x144.png', sizes: '144x144', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-152x152.png', sizes: '152x152', type: 'image/png', purpose: 'any' },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          { src: 'icons/icon-384x384.png', sizes: '384x384', type: 'image/png', purpose: 'any' },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      devOptions: {
        // 開發模式預設關閉 SW，避免干擾 HMR；離線驗證請用 `npm run build && npm run preview`
        enabled: false,
      },
    }),
  ],
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
