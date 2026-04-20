import { expect, test } from '@playwright/test'

/**
 * T040：US1 MVP 核心流程 E2E 測試。
 * iPhone 14 直向 viewport 下：
 *   1. 首頁 → 選擇「心動瞬間」主題
 *   2. 連續抽 15 張卡，確認無重複
 *   3. 抽完顯示結束訊息
 *   4. 返回首頁按鈕會導回 /
 */
const DECK_SIZE = 15

test.describe('US1 — 核心抽牌流程', () => {
  test('完成 15 張卡牌抽取且無重複，並返回首頁', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('選擇今晚想聊的主題')).toBeVisible()

    await page.getByTestId('theme-card-attraction').click()

    await expect(page).toHaveURL(/#\/game\/attraction$/)
    await expect(page.getByText('心動瞬間', { exact: true })).toBeVisible()

    const stack = page.getByTestId('card-stack')
    await expect(stack).toBeVisible()

    const seenTexts = new Set<string>()

    // 前 14 張：每次抽完仍停留於 GameView，可直接讀卡面文字驗證不重複。
    for (let index = 0; index < DECK_SIZE - 1; index += 1) {
      await stack.click()
      // 等 useCard 500ms 動畫鎖解除（以 aria-disabled 為可觀測訊號，取代硬等 timeout）。
      await expect(stack).toHaveAttribute('aria-disabled', 'false', { timeout: 2000 })

      // 卡片因 3D 翻轉使用 backface-visibility，改用 textContent 繞過可視性檢查。
      const primaryText = (
        (await page.getByTestId('card-primary-text').first().textContent()) ?? ''
      ).trim()
      expect(primaryText.length, `第 ${index + 1} 次抽牌未顯示主要文字`).toBeGreaterThan(0)
      expect(seenTexts.has(primaryText), `卡牌文字「${primaryText}」重複出現`).toBe(false)
      seenTexts.add(primaryText)
    }

    // 第 15 張：抽完會立即導向結束頁。
    await stack.click()
    await expect(page).toHaveURL(/#\/end\/attraction$/)
    await expect(page.getByTestId('end-message')).toBeVisible()

    await page.getByTestId('end-message-cta').click()
    await expect(page).toHaveURL(/#\/?$/)
    await expect(page.getByText('選擇今晚想聊的主題')).toBeVisible()
  })
})
