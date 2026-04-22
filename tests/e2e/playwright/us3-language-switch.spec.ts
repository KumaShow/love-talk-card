import { expect, Page, test } from '@playwright/test'

/**
 * T058：US3 副語言切換 E2E 測試。
 *
 * iPhone 14 直向 viewport 下驗證：
 *   1. 進入 GameView 抽第一張卡 → 預設副語言 EN，secondary <p lang> 為 "en"。
 *   2. 點 picked-view 內的 ไทย 按鈕 → aria-pressed 與 secondary <p lang>
 *      在 1 秒內變為 "th"，secondary 文字內容對應切換語言。
 *   3. 點下一張 → 抽第二張卡 → 副語言狀態持續為 "th"。
 *   4. 點 EN → secondary <p lang> 回復 "en"。
 *
 * UX 設計（A+C 方案）：
 *   LanguageSelector 從 AppHeader 移到 picked-view CTA 下方，
 *   單手姆指可快速觸及；僅在 phase==='reading' 顯示，idle 時不出現。
 *
 * 註：cards.json 目前 th / ja 欄位皆以 en 作為佔位文字（資料尚未翻譯），
 *     因此「次要文字」的可見內容在切換 EN ↔ ไทย 時可能完全相同；
 *     本測試以 `<p lang>` 屬性與 `aria-pressed` 同步性作為反應性證明，
 *     文字回退鏈邏輯由 tests/unit/utils/card-text.test.ts (T051) 覆蓋。
 */

async function openPickedView(page: Page): Promise<void> {
  await page.locator('[data-test="fan-deck"] .is-active').click()
  await page.getByTestId('picked-view').waitFor({ state: 'visible' })
  await page
    .locator('[data-test="picked-next"]:not([class*="picked-cta-enter"])')
    .waitFor({ state: 'visible' })
  // LanguageSelector 與 CTA 同 Transition group，等其進場結束才能穩定點擊
  await page
    .locator('[data-test="picked-language-selector"]:not([class*="picked-cta-enter"])')
    .waitFor({ state: 'visible' })
}

async function dismissPickedView(page: Page): Promise<void> {
  await page.getByTestId('picked-next').click()
  await expect(page.getByTestId('picked-view')).toHaveCount(0, { timeout: 3000 })
}

test.describe('US3 — 副語言切換', () => {
  test('在 GameView 切換 EN / ไทย 時，picked-view secondary 文字會即時更新並跨卡片保留', async ({
    page,
  }) => {
    test.setTimeout(60_000)

    await page.goto('/')

    await page.getByTestId('theme-deck-attraction').click()
    await expect(page.getByTestId('home-preview')).toBeVisible()
    await page.getByTestId('preview-cta').click()
    await expect(page).toHaveURL(/#\/game\/attraction$/)

    // 抽第一張卡 → picked-view overlay 出現後，內含 LanguageSelector，預設 EN 啟用
    await openPickedView(page)

    const enBtn = page.locator('[data-test="picked-language-selector"] [data-test="lang-en"]')
    const thBtn = page.locator('[data-test="picked-language-selector"] [data-test="lang-th"]')
    const jaBtn = page.locator('[data-test="picked-language-selector"] [data-test="lang-ja"]')
    await expect(enBtn).toHaveAttribute('aria-pressed', 'true')
    await expect(thBtn).toHaveAttribute('aria-pressed', 'false')
    await expect(jaBtn).toHaveAttribute('aria-pressed', 'false')

    const secondary = page.locator(
      '[data-test="picked-view"] [data-test="card-secondary-text"]',
    )
    await expect(secondary).toBeVisible()
    await expect(secondary).toHaveAttribute('lang', 'en')
    const enText = ((await secondary.textContent()) ?? '').trim()
    expect(enText.length, '預設副語言應顯示非空 secondary 文字').toBeGreaterThan(0)

    // 切換到 ไทย：aria-pressed 與 secondary <p lang> 應在 1 秒內同步
    await thBtn.click()
    await expect(thBtn).toHaveAttribute('aria-pressed', 'true', { timeout: 1000 })
    await expect(enBtn).toHaveAttribute('aria-pressed', 'false', { timeout: 1000 })
    await expect(secondary).toHaveAttribute('lang', 'th', { timeout: 1000 })
    const thText = ((await secondary.textContent()) ?? '').trim()
    expect(thText.length, '切換 ไทย 後 secondary 文字仍應為非空').toBeGreaterThan(0)

    // 抽下一張：泰文偏好應跨卡片保留
    await dismissPickedView(page)
    await openPickedView(page)
    await expect(thBtn).toHaveAttribute('aria-pressed', 'true')
    await expect(secondary).toHaveAttribute('lang', 'th')

    // 切回 EN：secondary <p lang> 與按鈕狀態同步回復
    await enBtn.click()
    await expect(enBtn).toHaveAttribute('aria-pressed', 'true', { timeout: 1000 })
    await expect(thBtn).toHaveAttribute('aria-pressed', 'false', { timeout: 1000 })
    await expect(secondary).toHaveAttribute('lang', 'en', { timeout: 1000 })
  })
})
