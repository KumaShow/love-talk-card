import { expect, Page, test } from '@playwright/test'

/**
 * T095：US1 核心抽牌流程 E2E 測試（Phase 9 UX 重塑後）。
 *
 * iPhone 14 直向 viewport 下：
 *   1. 首頁 → 看到 2×2 卡堆網格
 *   2. 點「心動瞬間」卡堆 → 預覽浮層出現
 *   3. 點「開始對話」CTA → 進入 /#/game/attraction 並看到扇形牌堆
 *   4. 迴圈點中央卡 → picked-view overlay 翻面顯示 prompt → 點下一張
 *      前 14 張：驗證文字無重複、下一張自動補位
 *   5. 第 15 張：點下一張後自動導向 /#/end/attraction、顯示結束訊息
 *   6. 返回首頁按鈕會導回 /
 */
const DECK_SIZE = 15

async function waitForPickedNextReady(page: Page): Promise<void> {
  // 等 picked-next 進場動畫結束（enter/leave class 已被 Vue Transition 移除）
  // 如此 click 不會被 Playwright 的 stability check 以 "not stable" 拒絕。
  await page
    .locator('[data-test="picked-next"]:not([class*="picked-cta-enter"])')
    .waitFor({ state: 'visible' })
}

async function drawCenterCardAndReadText(page: Page): Promise<string> {
  // 中央卡以 .is-active class 為穩定 selector（不依賴 visibleCards 長度變化造成的 index 位移）
  await page.locator('[data-test="fan-deck"] .is-active').click()

  await page.getByTestId('picked-view').waitFor({ state: 'visible' })
  await waitForPickedNextReady(page)

  const primaryText = (
    (await page
      .locator('[data-test="picked-view"] [data-test="card-primary-text"]')
      .textContent()) ?? ''
  ).trim()

  return primaryText
}

test.describe('US1 — 核心抽牌流程', () => {
  test('完成 15 張卡牌抽取且無重複，並返回首頁', async ({ page }) => {
    // 新 UX 每輪抽牌含 flip 650ms + dismiss 460ms + CTA 進場 240ms + 安全緩衝，
    // 共 ~2s；15 輪加上 routing 與斷言約需 45s，故拉高至 120s。
    test.setTimeout(120_000)

    await page.goto('/')

    await expect(page.getByText('挑選一副牌堆')).toBeVisible()
    await expect(page.getByTestId('theme-deck-grid')).toBeVisible()

    // 點主題卡堆 → 預覽浮層浮出
    await page.getByTestId('theme-deck-attraction').click()
    await expect(page.getByTestId('home-preview')).toBeVisible()
    await expect(page.getByTestId('preview-cta')).toBeVisible()

    // 點 CTA 開始對話 → 進入扇形抽牌畫面
    await page.getByTestId('preview-cta').click()
    await expect(page).toHaveURL(/#\/game\/attraction$/)
    await expect(page.getByText('心動瞬間', { exact: true })).toBeVisible()

    const fanDeck = page.getByTestId('fan-deck')
    await expect(fanDeck).toBeVisible()

    const seenTexts = new Set<string>()

    // 前 14 張：中央卡 → overlay → 下一張
    for (let index = 0; index < DECK_SIZE - 1; index += 1) {
      const primaryText = await drawCenterCardAndReadText(page)
      expect(primaryText.length, `第 ${index + 1} 次抽牌未顯示主要文字`).toBeGreaterThan(0)
      expect(seenTexts.has(primaryText), `卡牌文字「${primaryText}」重複出現`).toBe(false)
      seenTexts.add(primaryText)

      // 點下一張 → overlay 飛出、扇形自動補位
      await page.getByTestId('picked-next').click()
      // dismissing 動畫 460ms 後 phase=idle、pickedCard=null → picked-view v-if 失效 DOM 卸載
      await expect(page.getByTestId('picked-view')).toHaveCount(0, { timeout: 3000 })
    }

    // 第 15 張：overlay 翻面後點下一張 → 直接導向結束頁
    const lastText = await drawCenterCardAndReadText(page)
    expect(lastText.length, '第 15 次抽牌未顯示主要文字').toBeGreaterThan(0)
    expect(seenTexts.has(lastText), `最後一張卡牌文字「${lastText}」重複出現`).toBe(false)

    await page.getByTestId('picked-next').click()
    await expect(page).toHaveURL(/#\/end\/attraction$/)
    await expect(page.getByTestId('end-message')).toBeVisible()

    await page.getByTestId('end-message-cta').click()
    await expect(page).toHaveURL(/#\/?$/)
    await expect(page.getByText('挑選一副牌堆')).toBeVisible()
  })
})
