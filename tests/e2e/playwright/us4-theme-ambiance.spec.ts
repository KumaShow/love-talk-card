import { expect, type Page, test } from '@playwright/test'

import cardsData from '@/data/cards.json' with { type: 'json' }
import type { CardsData, ThemeId } from '@/types'

// cards.json 的色票為主題色權威來源（contracts/card-data.schema.json）。
// 以 TS 5.x + Node 20 LTS 支援的 import attributes（`with { type: 'json' }`）直接載入。
const dataset = cardsData as CardsData

/**
 * T065：US4 沉浸式主題氛圍 E2E 測試。
 *
 * 驗證 `useTheme` composable 在 HomeView / GameView / EndView 的串接：
 * - 首頁為中性預設色（inline CSS 變數被清空，走 :root 預設）
 * - 4 種主題都會把 6 個 CSS 變數寫到 `document.documentElement.style`
 * - 平滑過場 300–500ms（#app 的 transition-duration）
 * - 直連 GameView / EndView 亦正確套用主題
 * - 無效 themeId 會被 router 守衛導回首頁，不會退化成預設主題頁
 */
const THEME_IDS: ThemeId[] = ['attraction', 'self', 'interaction', 'trust']

const CSS_VAR_NAMES = [
  '--color-bg',
  '--color-bg-end',
  '--color-primary',
  '--color-secondary',
  '--color-text',
  '--color-card-back',
] as const

type CssVarName = (typeof CSS_VAR_NAMES)[number]

function findTheme(themeId: ThemeId) {
  const theme = dataset.themes.find((entry) => entry.id === themeId)
  if (!theme) {
    throw new Error(`cards.json 缺少主題 ${themeId}`)
  }
  return theme
}

async function readInlineVars(page: Page): Promise<Record<CssVarName, string>> {
  return page.evaluate((names) => {
    const root = document.documentElement
    const result: Record<string, string> = {}
    names.forEach((name) => {
      // 讀 inline style 而非 computed；inline 為空即代表尚未套用 applyTheme
      result[name] = root.style.getPropertyValue(name).trim()
    })
    return result as Record<string, string>
  }, CSS_VAR_NAMES as unknown as string[])
}

async function assertThemeVarsMatch(page: Page, themeId: ThemeId): Promise<void> {
  const theme = findTheme(themeId)
  await expect
    .poll(async () => readInlineVars(page), { timeout: 2000 })
    .toEqual({
      '--color-bg': theme.colors.background,
      '--color-bg-end': theme.colors.backgroundEnd,
      '--color-primary': theme.colors.primary,
      '--color-secondary': theme.colors.secondary,
      '--color-text': theme.colors.text,
      '--color-card-back': theme.colors.cardBack,
    })
}

async function readAppTransitionDurationMs(page: Page): Promise<number[]> {
  return page.evaluate(() => {
    const app = document.getElementById('app')
    if (!app) {
      return []
    }
    const raw = window.getComputedStyle(app).transitionDuration
    // 可能會是 "0.5s, 0.5s, 0.5s" 這類逗號分隔字串；逐段轉成毫秒
    return raw.split(',').map((segment) => {
      const trimmed = segment.trim()
      if (trimmed.endsWith('ms')) {
        return Number.parseFloat(trimmed)
      }
      if (trimmed.endsWith('s')) {
        return Number.parseFloat(trimmed) * 1000
      }
      // 非預期單位（例如空字串或未來 CSS 新單位）刻意回傳 NaN：
      // 外層 toBeGreaterThanOrEqual(300) 對 NaN 一定會失敗，藉此把問題
      // 直接抬到測試結果，而不是默默吞掉後用 0 帶過。
      return Number.NaN
    })
  })
}

test.describe('US4 沉浸式主題氛圍', () => {
  test('首頁為中性預設色，CSS 變數應無 inline 覆寫', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-test="theme-deck-grid"]')).toBeVisible()

    const vars = await readInlineVars(page)
    for (const name of CSS_VAR_NAMES) {
      expect(vars[name], `首頁不應寫入 ${name} inline style`).toBe('')
    }
  })

  test('從首頁選主題進入 GameView，背景漸層切換至該主題色', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-test="theme-deck-grid"]')).toBeVisible()

    await page.locator('[data-test="theme-deck-attraction"]').click()
    await page.locator('[data-test="preview-cta"]').click()
    await expect(page).toHaveURL(/#\/game\/attraction$/)
    await expect(page.locator('[data-test="fan-deck"]')).toBeVisible()

    await assertThemeVarsMatch(page, 'attraction')

    // #app transition-duration 應在 300–500ms 之間（憲章要求）
    const durations = await readAppTransitionDurationMs(page)
    expect(durations.length).toBeGreaterThan(0)
    for (const ms of durations) {
      expect(ms).toBeGreaterThanOrEqual(300)
      expect(ms).toBeLessThanOrEqual(500)
    }
  })

  test('返回首頁後改選另一主題，氛圍色會更新', async ({ page }) => {
    await page.goto('/')
    await page.locator('[data-test="theme-deck-attraction"]').click()
    await page.locator('[data-test="preview-cta"]').click()
    await expect(page.locator('[data-test="fan-deck"]')).toBeVisible()

    // 透過 AppHeader 返回按鈕回到首頁
    await page.locator('[data-test="app-header-back"]').click()
    await expect(page).toHaveURL(/#\/$/)

    // 回首頁後 inline 變數會被 resetTheme 清空
    const afterReset = await readInlineVars(page)
    expect(afterReset['--color-bg']).toBe('')

    // 改選 trust 主題，進入 GameView 應看到 trust 色
    await page.locator('[data-test="theme-deck-trust"]').click()
    await page.locator('[data-test="preview-cta"]').click()
    await expect(page.locator('[data-test="fan-deck"]')).toBeVisible()

    await assertThemeVarsMatch(page, 'trust')
  })

  test('以有效 themeId URL 直接進入 GameView，主題色仍會套用', async ({ page }) => {
    await page.goto('/#/game/interaction')
    await expect(page.locator('[data-test="fan-deck"]')).toBeVisible()
    await assertThemeVarsMatch(page, 'interaction')
  })

  test('以有效 themeId URL 直接進入 EndView，主題色仍會套用', async ({ page }) => {
    await page.goto('/#/end/self')
    // EndView 的 EndMessage 會渲染「返回首頁」按鈕，以此確認頁面已載入
    await expect(page.getByRole('button', { name: '返回首頁' })).toBeVisible()
    await assertThemeVarsMatch(page, 'self')
  })

  test('以無效 themeId URL 直連時會被守衛導回首頁，不會套用預設主題頁', async ({ page }) => {
    await page.goto('/#/game/not-a-theme')
    await expect(page).toHaveURL(/#\/$/)
    await expect(page.locator('[data-test="theme-deck-grid"]')).toBeVisible()

    // 被導回後 HomeView.resetTheme 會清掉 inline style，不會殘留預設主題色
    const vars = await readInlineVars(page)
    for (const name of CSS_VAR_NAMES) {
      expect(vars[name]).toBe('')
    }
  })

  test.describe('四個主題依序驗證', () => {
    for (const themeId of THEME_IDS) {
      test(`主題 ${themeId} 的 6 個 CSS 變數對應 cards.json`, async ({ page }) => {
        await page.goto(`/#/game/${themeId}`)
        await expect(page.locator('[data-test="fan-deck"]')).toBeVisible()
        await assertThemeVarsMatch(page, themeId)
      })
    }
  })
})
