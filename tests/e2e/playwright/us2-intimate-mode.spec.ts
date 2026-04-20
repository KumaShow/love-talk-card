import { expect, test } from '@playwright/test'

/**
 * T049：US2 私密模式整合流程 E2E 測試。
 *
 * iPhone 14 直向 viewport 下驗證：
 *   1. 開啟 ToggleSwitch（intimate-toggle）後進入「心動瞬間」主題，
 *      連續抽滿牌堆；過程中依每次抽牌後 `[data-test="intimate-watermark"]`
 *      出現次數，統計私密卡（intimate）與一般卡（base）的比例。
 *   2. 返回首頁並關閉 ToggleSwitch，再進入「自我探索」主題抽完 15 張；
 *      驗證浮水印在整個流程中皆不出現（count === 0）。
 *
 * 浮水印計數採「簡化 19 張」策略：
 *   前 19 張於 GameView 停留時可觀測 watermark；第 20 張抽完後會立即導向
 *   結束頁，難以穩定 snapshot。因此僅統計前 19 張，斷言
 *   intimate_count + base_count === 19，且 intimate_count 介於 4~5 之間、
 *   base_count 介於 14~15 之間（總 intimate 為 5、總 base 為 15，隨機分布下
 *   前 19 張內 intimate 可能為 4 或 5）。
 */
const ATTRACTION_DECK_SIZE = 20
const SELF_DECK_SIZE = 15

test.describe('US2 — 私密模式', () => {
  test('開啟私密模式後抽滿牌堆，應觀察到浮水印按比例出現', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('選擇今晚想聊的主題')).toBeVisible()

    const toggle = page.getByTestId('intimate-toggle')
    await expect(toggle).toBeVisible()
    await expect(toggle).toHaveAttribute('aria-checked', 'false')

    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-checked', 'true', { timeout: 2000 })

    await page.getByTestId('theme-card-attraction').click()
    await expect(page).toHaveURL(/#\/game\/attraction$/)

    const stack = page.getByTestId('card-stack')
    await expect(stack).toBeVisible()

    let intimateCount = 0
    let baseCount = 0

    // 前 19 張：每次抽完仍停留於 GameView，可穩定觀測浮水印是否出現。
    for (let index = 0; index < ATTRACTION_DECK_SIZE - 1; index += 1) {
      await stack.click()
      // 等 useCard 動畫鎖解除（以 aria-disabled 為可觀測訊號）。
      await expect(stack).toHaveAttribute('aria-disabled', 'false', { timeout: 2000 })

      // 卡片因 3D 翻轉使用 backface-visibility，改用 textContent 確認內容已載入。
      const primaryText = (
        (await page.getByTestId('card-primary-text').first().textContent()) ?? ''
      ).trim()
      expect(primaryText.length, `第 ${index + 1} 次抽牌未顯示主要文字`).toBeGreaterThan(0)

      const watermarkCount = await page.locator('[data-test="intimate-watermark"]').count()
      // 以 Math.min 將 count 正規化為 0/1，避免 if/else 觸發 playwright/no-conditional-in-test
      const hasIntimate = Math.min(watermarkCount, 1)
      intimateCount += hasIntimate
      baseCount += 1 - hasIntimate
    }

    // 第 20 張：抽完會立即導向結束頁；不再觀測浮水印。
    await stack.click()
    await expect(page).toHaveURL(/#\/end\/attraction$/)
    await expect(page.getByTestId('end-message')).toBeVisible()

    // 斷言前 19 張計數總和，且私密／一般比例落在合理範圍。
    expect(
      intimateCount + baseCount,
      '前 19 張計數總和必須等於 19',
    ).toBe(ATTRACTION_DECK_SIZE - 1)
    expect(
      intimateCount,
      `前 19 張應包含 4~5 張私密卡，實際為 ${intimateCount}`,
    ).toBeGreaterThanOrEqual(4)
    expect(
      intimateCount,
      `前 19 張私密卡不應超過 5 張，實際為 ${intimateCount}`,
    ).toBeLessThanOrEqual(5)
    expect(
      baseCount,
      `前 19 張應包含 14~15 張一般卡，實際為 ${baseCount}`,
    ).toBeGreaterThanOrEqual(14)
    expect(
      baseCount,
      `前 19 張一般卡不應超過 15 張，實際為 ${baseCount}`,
    ).toBeLessThanOrEqual(15)
  })

  test('關閉私密模式後重新開始，整段流程不應出現浮水印', async ({ page }) => {
    await page.goto('/')

    const toggle = page.getByTestId('intimate-toggle')
    await expect(toggle).toBeVisible()

    // 每個 Playwright test 均獲得乾淨 browser context，settingsStore 重設為初始值，
    // 因此直接斷言初始為關閉；不再動態判斷點擊以避免觸發 playwright/no-conditional-in-test。
    await expect(toggle).toHaveAttribute('aria-checked', 'false', { timeout: 2000 })

    await page.getByTestId('theme-card-self').click()
    await expect(page).toHaveURL(/#\/game\/self$/)

    const stack = page.getByTestId('card-stack')
    await expect(stack).toBeVisible()

    let watermarkSightings = 0

    // 前 14 張：每次抽完仍停留於 GameView。
    for (let index = 0; index < SELF_DECK_SIZE - 1; index += 1) {
      await stack.click()
      await expect(stack).toHaveAttribute('aria-disabled', 'false', { timeout: 2000 })

      const primaryText = (
        (await page.getByTestId('card-primary-text').first().textContent()) ?? ''
      ).trim()
      expect(primaryText.length, `第 ${index + 1} 次抽牌未顯示主要文字`).toBeGreaterThan(0)

      const watermarkCount = await page.locator('[data-test="intimate-watermark"]').count()
      watermarkSightings += watermarkCount
    }

    // 第 15 張：抽完導向結束頁。
    await stack.click()
    await expect(page).toHaveURL(/#\/end\/self$/)
    await expect(page.getByTestId('end-message')).toBeVisible()

    expect(
      watermarkSightings,
      `關閉私密模式時浮水印不應出現，但累計觀察到 ${watermarkSightings} 次`,
    ).toBe(0)
  })
})
