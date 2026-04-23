import { spawn, type ChildProcess } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

import { expect, test } from '@playwright/test'

/**
 * T085：效能煙霧測試。
 *
 * 為模擬真實行動裝置體驗，本 spec 不使用 dev server（未 minify + HMR 會大幅
 * 拉高 FCP），改以 production build 的 `vite preview` 為測試目標：
 *   1. Chromium DevTools Protocol 模擬 Good 4G 下首頁 FCP < 1500ms。
 *   2. 驗證抽牌 overlay 的 3D flip transition duration = 600ms。
 *   3. 驗證抽牌 overlay 的 dismiss transform transition = 460ms。
 *
 * 僅在 chromium-mobile-pwa project 跑（WebKit 不支援 CDP emulate + SW 相關 API）。
 */

const PREVIEW_PORT = 4174
const PREVIEW_URL = `http://localhost:${PREVIEW_PORT}`
const FCP_BUDGET_MS = 1500

let previewProcess: ChildProcess | null = null

function runCommand(command: string, args: readonly string[]): Promise<void> {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, [...args], {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: true,
    })
    // spawn 失敗（找不到指令、權限錯誤等）時會只觸發 error，不會觸發 exit；
    // 若無 error handler，Promise 會永遠 hang 住 Playwright beforeAll。
    child.on('error', rejectPromise)
    // 用 close 而非 exit，確保 stdio 完成 flush 後才結束，避免輸出被截斷。
    child.on('close', (code) => {
      if (code === 0) resolvePromise()
      else rejectPromise(new Error(`${command} exited with code ${code}`))
    })
  })
}

async function waitPreviewReady(url: string, timeoutMs = 20_000): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch {
      /* 尚未就緒，繼續重試 */
    }
    await delay(250)
  }
  throw new Error(`preview server at ${url} not ready within ${timeoutMs}ms`)
}

/**
 * 全域 playwright.config.ts 設 `timeout: 30s`，但 beforeAll 要跑完 `npm run build`
 * 再等 preview server ready，在 CI 或較慢機器上會遠超 30s 造成 hook 超時。
 * 這裡把整個 describe（含 beforeAll 與 2 條 test）的 timeout 拉到 180s，
 * 與 us5-offline-pwa 同量級，確保穩定性。
 */
test.describe.configure({ timeout: 180_000 })

test.describe('效能煙霧', () => {
  test.beforeAll(async () => {
    // 1. production build（已由 US5 的 beforeAll 產 dist/，但這邊獨立 spec 也要保證）
    await runCommand('npm', ['run', 'build'])

    // 2. 啟動獨立 port 的 preview server，避免與 US5 的 4173 衝突
    previewProcess = spawn(
      'npm',
      ['run', 'preview', '--', '--port', String(PREVIEW_PORT), '--strictPort'],
      { cwd: process.cwd(), stdio: 'inherit', shell: true },
    )
    await waitPreviewReady(PREVIEW_URL)
  })

  test.afterAll(() => {
    if (previewProcess) {
      previewProcess.kill('SIGTERM')
      previewProcess = null
    }
  })

  test('模擬 4G 下首頁 FCP < 1500ms（production build）', async ({ page, context }) => {
    // Chromium DevTools Protocol：模擬 Good 4G（150ms RTT、1.5Mbps）
    const client = await context.newCDPSession(page)
    await client.send('Network.enable')
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 150,
      downloadThroughput: (1.5 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
      connectionType: 'cellular4g',
    })

    await page.goto(PREVIEW_URL)
    await expect(page.getByText('挑選一副牌堆')).toBeVisible()

    const fcp = await page.evaluate(() => {
      const entry = performance.getEntriesByName('first-contentful-paint')[0]
      return entry?.startTime ?? null
    })

    expect(fcp, 'performance 未取得 first-contentful-paint entry').not.toBeNull()
    expect(fcp as number).toBeLessThan(FCP_BUDGET_MS)
  })

  test('PickedCardView flip 動畫為 600ms、dismiss transform 為 460ms', async ({ page }) => {
    await page.goto(PREVIEW_URL)
    await page.getByTestId('theme-deck-attraction').click()
    await page.getByTestId('preview-cta').click()
    await expect(page.getByTestId('fan-deck')).toBeVisible()

    await page.locator('[data-test="fan-deck"] .is-active').click()
    const picked = page.getByTestId('picked-view')
    await expect(picked).toBeVisible()

    // Vue <Transition> 在進場期間會在 .picked 上加 `picked-shell-enter-active`，
    // 期間 getComputedStyle 讀到的是 Transition 自身的 transition（opacity 240ms / transform 420ms），
    // 而非 .picked.is-dismissing 想驗證的 460ms。等 class 被自動移除才反映最終樣式。
    // 改用事件/條件式等待避免硬編碼 sleep（符合 playwright/no-wait-for-timeout 最佳實踐）。
    await picked.evaluate((el) =>
      el.classList.contains('picked-shell-enter-active')
        ? new Promise<void>((resolve) => {
            el.addEventListener('transitionend', () => resolve(), { once: true })
          })
        : undefined,
    )
    await expect(picked).not.toHaveClass(/picked-shell-enter-active/)

    const { flipDurationMs, dismissDurationMs } = await page.evaluate(() => {
      const parseMs = (value: string): number => {
        const v = value.trim()
        if (v.endsWith('ms')) return parseFloat(v)
        if (v.endsWith('s')) return parseFloat(v) * 1000
        return 0
      }
      const durationOf = (el: HTMLElement, prop: string): number => {
        const style = getComputedStyle(el)
        const properties = style.transitionProperty.split(',').map((s) => s.trim())
        const durations = style.transitionDuration.split(',').map((s) => s.trim())
        const idx = properties.indexOf(prop)
        if (idx < 0 || idx >= durations.length) return 0
        return parseMs(durations[idx])
      }

      const picked = document.querySelector('[data-test="picked-view"]') as HTMLElement
      const inner = picked?.querySelector('.picked__inner') as HTMLElement
      return {
        flipDurationMs: durationOf(inner, 'transform'),
        dismissDurationMs: durationOf(picked, 'transform'),
      }
    })

    expect(flipDurationMs).toBe(600)
    expect(dismissDurationMs).toBe(460)
  })
})
